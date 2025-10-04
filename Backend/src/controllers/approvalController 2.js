import { supabase } from '../config/supabase.js';

export async function getApprovalWorkflows(req, res) {
  try {
    const { expenseId } = req.query;

    let query = supabase
      .from('approval_workflows')
      .select(`
        *,
        approver:users!approval_workflows_approver_id_fkey(id, full_name)
      `)
      .eq('company_id', req.company.id);

    if (expenseId) {
      query = query.eq('expense_id', expenseId);
    }

    if (req.user.role === 'manager') {
      query = query.eq('approver_id', req.user.id);
    }

    const { data, error } = await query.order('step_order', { ascending: true });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    const workflows = data.map(workflow => ({
      id: workflow.id,
      companyId: workflow.company_id,
      expenseId: workflow.expense_id,
      approverId: workflow.approver_id,
      approverName: workflow.approver.full_name,
      stepOrder: workflow.step_order,
      status: workflow.status,
      comments: workflow.comments,
      approvedAt: workflow.approved_at,
      createdAt: workflow.created_at
    }));

    return res.status(200).json(workflows);
  } catch (error) {
    console.error('Get workflows error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function approveExpense(req, res) {
  try {
    const { id } = req.params;
    const { comments } = req.body;

    const { data: workflow, error: workflowError } = await supabase
      .from('approval_workflows')
      .select('*')
      .eq('expense_id', id)
      .eq('approver_id', req.user.id)
      .eq('status', 'pending')
      .single();

    if (workflowError || !workflow) {
      return res.status(404).json({ error: 'Approval workflow not found' });
    }

    const { error: updateWorkflowError } = await supabase
      .from('approval_workflows')
      .update({
        status: 'approved',
        comments,
        approved_at: new Date().toISOString()
      })
      .eq('id', workflow.id);

    if (updateWorkflowError) {
      return res.status(500).json({ error: updateWorkflowError.message });
    }

    const { data: allWorkflows } = await supabase
      .from('approval_workflows')
      .select('*')
      .eq('expense_id', id);

    const { data: rules } = await supabase
      .from('approval_rules')
      .select('*')
      .eq('company_id', req.company.id)
      .eq('is_active', true);

    let expenseStatus = 'pending';
    const pendingWorkflows = allWorkflows.filter(w => w.status === 'pending');

    if (pendingWorkflows.length === 0) {
      if (rules && rules.length > 0) {
        expenseStatus = evaluateApprovalRules(rules, allWorkflows, req.user.id);
      } else {
        expenseStatus = 'approved';
      }
    }

    const { data: expense, error: expenseError } = await supabase
      .from('expenses')
      .update({
        status: expenseStatus,
        current_approver_step: workflow.step_order + 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (expenseError) {
      return res.status(500).json({ error: expenseError.message });
    }

    return res.status(200).json({
      message: 'Expense approved successfully',
      expense: {
        id: expense.id,
        status: expense.status,
        currentApproverStep: expense.current_approver_step
      }
    });
  } catch (error) {
    console.error('Approve expense error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function rejectExpense(req, res) {
  try {
    const { id } = req.params;
    const { comments } = req.body;

    const { data: workflow, error: workflowError } = await supabase
      .from('approval_workflows')
      .select('*')
      .eq('expense_id', id)
      .eq('approver_id', req.user.id)
      .eq('status', 'pending')
      .single();

    if (workflowError || !workflow) {
      return res.status(404).json({ error: 'Approval workflow not found' });
    }

    const { error: updateWorkflowError } = await supabase
      .from('approval_workflows')
      .update({
        status: 'rejected',
        comments,
        approved_at: new Date().toISOString()
      })
      .eq('id', workflow.id);

    if (updateWorkflowError) {
      return res.status(500).json({ error: updateWorkflowError.message });
    }

    const { data: expense, error: expenseError } = await supabase
      .from('expenses')
      .update({
        status: 'rejected',
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (expenseError) {
      return res.status(500).json({ error: expenseError.message });
    }

    return res.status(200).json({
      message: 'Expense rejected successfully',
      expense: {
        id: expense.id,
        status: expense.status
      }
    });
  } catch (error) {
    console.error('Reject expense error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

function evaluateApprovalRules(rules, workflows, currentApproverId) {
  for (const rule of rules) {
    if (rule.rule_type === 'specific_approver') {
      if (rule.specific_approver_id === currentApproverId) {
        return 'approved';
      }
    }

    if (rule.rule_type === 'percentage') {
      const approvedCount = workflows.filter(w => w.status === 'approved').length;
      const totalCount = workflows.length;
      const percentage = (approvedCount / totalCount) * 100;

      if (percentage >= rule.percentage_threshold) {
        return 'approved';
      }
    }

    if (rule.rule_type === 'hybrid') {
      if (rule.specific_approver_id === currentApproverId) {
        return 'approved';
      }

      const approvedCount = workflows.filter(w => w.status === 'approved').length;
      const totalCount = workflows.length;
      const percentage = (approvedCount / totalCount) * 100;

      if (percentage >= rule.percentage_threshold) {
        return 'approved';
      }
    }
  }

  return 'pending';
}

export async function getApprovalRules(req, res) {
  try {
    const { data, error } = await supabase
      .from('approval_rules')
      .select(`
        *,
        specific_approver:users!approval_rules_specific_approver_id_fkey(id, full_name)
      `)
      .eq('company_id', req.company.id)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    const rules = data.map(rule => ({
      id: rule.id,
      companyId: rule.company_id,
      name: rule.name,
      ruleType: rule.rule_type,
      percentageThreshold: rule.percentage_threshold,
      specificApproverId: rule.specific_approver_id,
      specificApproverName: rule.specific_approver?.full_name,
      isActive: rule.is_active,
      createdAt: rule.created_at
    }));

    return res.status(200).json(rules);
  } catch (error) {
    console.error('Get approval rules error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function createApprovalRule(req, res) {
  try {
    const { name, ruleType, percentageThreshold, specificApproverId, isActive } = req.body;

    if (!name || !ruleType) {
      return res.status(400).json({ error: 'Name and rule type are required' });
    }

    const { data: rule, error } = await supabase
      .from('approval_rules')
      .insert({
        company_id: req.company.id,
        name,
        rule_type: ruleType,
        percentage_threshold: percentageThreshold || null,
        specific_approver_id: specificApproverId || null,
        is_active: isActive !== undefined ? isActive : true
      })
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(201).json({
      id: rule.id,
      companyId: rule.company_id,
      name: rule.name,
      ruleType: rule.rule_type,
      percentageThreshold: rule.percentage_threshold,
      specificApproverId: rule.specific_approver_id,
      isActive: rule.is_active,
      createdAt: rule.created_at
    });
  } catch (error) {
    console.error('Create approval rule error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function updateApprovalRule(req, res) {
  try {
    const { id } = req.params;
    const { name, ruleType, percentageThreshold, specificApproverId, isActive } = req.body;

    const updates = {};
    if (name) updates.name = name;
    if (ruleType) updates.rule_type = ruleType;
    if (percentageThreshold !== undefined) updates.percentage_threshold = percentageThreshold;
    if (specificApproverId !== undefined) updates.specific_approver_id = specificApproverId;
    if (isActive !== undefined) updates.is_active = isActive;

    const { data: rule, error } = await supabase
      .from('approval_rules')
      .update(updates)
      .eq('id', id)
      .eq('company_id', req.company.id)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({
      id: rule.id,
      companyId: rule.company_id,
      name: rule.name,
      ruleType: rule.rule_type,
      percentageThreshold: rule.percentage_threshold,
      specificApproverId: rule.specific_approver_id,
      isActive: rule.is_active,
      createdAt: rule.created_at
    });
  } catch (error) {
    console.error('Update approval rule error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function deleteApprovalRule(req, res) {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('approval_rules')
      .delete()
      .eq('id', id)
      .eq('company_id', req.company.id);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ message: 'Approval rule deleted successfully' });
  } catch (error) {
    console.error('Delete approval rule error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
