import { supabase } from '../config/supabase.js';
import { convertCurrency } from '../utils/currency.js';
import { extractTextFromImage, parseExpenseFromText } from '../utils/ocr.js';

export async function getAllExpenses(req, res) {
  try {
    let query = supabase
      .from('expenses')
      .select(`
        *,
        employee:users!expenses_employee_id_fkey(id, full_name)
      `)
      .eq('company_id', req.company.id);

    if (req.user.role === 'employee') {
      query = query.eq('employee_id', req.user.id);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    const expenses = data.map(expense => ({
      id: expense.id,
      companyId: expense.company_id,
      employeeId: expense.employee_id,
      employeeName: expense.employee.full_name,
      amount: parseFloat(expense.amount),
      currency: expense.currency,
      amountInCompanyCurrency: parseFloat(expense.amount_in_company_currency),
      category: expense.category,
      description: expense.description,
      expenseDate: expense.expense_date,
      receiptUrl: expense.receipt_url,
      status: expense.status,
      currentApproverStep: expense.current_approver_step,
      createdAt: expense.created_at,
      updatedAt: expense.updated_at
    }));

    return res.status(200).json(expenses);
  } catch (error) {
    console.error('Get expenses error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function createExpense(req, res) {
  try {
    const { amount, currency, category, description, expenseDate, receiptUrl } = req.body;

    if (!amount || !currency || !category || !description || !expenseDate) {
      return res.status(400).json({ error: 'Required fields missing' });
    }

    const amountInCompanyCurrency = await convertCurrency(
      amount,
      currency,
      req.company.currency
    );

    const { data: expense, error: expenseError } = await supabase
      .from('expenses')
      .insert({
        company_id: req.company.id,
        employee_id: req.user.id,
        amount,
        currency,
        amount_in_company_currency: amountInCompanyCurrency,
        category,
        description,
        expense_date: expenseDate,
        receipt_url: receiptUrl || null,
        status: 'pending',
        current_approver_step: 1
      })
      .select()
      .single();

    if (expenseError) {
      return res.status(500).json({ error: expenseError.message });
    }

    await createApprovalWorkflow(expense.id, req.user.id, req.company.id);

    return res.status(201).json({
      id: expense.id,
      companyId: expense.company_id,
      employeeId: expense.employee_id,
      employeeName: req.user.full_name,
      amount: parseFloat(expense.amount),
      currency: expense.currency,
      amountInCompanyCurrency: parseFloat(expense.amount_in_company_currency),
      category: expense.category,
      description: expense.description,
      expenseDate: expense.expense_date,
      receiptUrl: expense.receipt_url,
      status: expense.status,
      currentApproverStep: expense.current_approver_step,
      createdAt: expense.created_at,
      updatedAt: expense.updated_at
    });
  } catch (error) {
    console.error('Create expense error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function createApprovalWorkflow(expenseId, employeeId, companyId) {
  const { data: employee } = await supabase
    .from('users')
    .select('*')
    .eq('id', employeeId)
    .single();

  const workflows = [];
  let stepOrder = 1;

  if (employee.is_manager_approver && employee.manager_id) {
    const { data: manager } = await supabase
      .from('users')
      .select('*')
      .eq('id', employee.manager_id)
      .single();

    if (manager) {
      workflows.push({
        company_id: companyId,
        expense_id: expenseId,
        approver_id: manager.id,
        step_order: stepOrder,
        status: 'pending'
      });
      stepOrder++;
    }
  }

  const { data: managers } = await supabase
    .from('users')
    .select('*')
    .eq('company_id', companyId)
    .eq('role', 'manager')
    .neq('id', employee.manager_id || '');

  managers?.forEach(manager => {
    workflows.push({
      company_id: companyId,
      expense_id: expenseId,
      approver_id: manager.id,
      step_order: stepOrder,
      status: 'pending'
    });
  });

  if (workflows.length > 0) {
    await supabase.from('approval_workflows').insert(workflows);
  }
}

export async function updateExpense(req, res) {
  try {
    const { id } = req.params;
    const { amount, currency, category, description, expenseDate, receiptUrl } = req.body;

    const updates = {
      updated_at: new Date().toISOString()
    };

    if (amount !== undefined && currency) {
      updates.amount = amount;
      updates.currency = currency;
      updates.amount_in_company_currency = await convertCurrency(
        amount,
        currency,
        req.company.currency
      );
    }
    if (category) updates.category = category;
    if (description) updates.description = description;
    if (expenseDate) updates.expense_date = expenseDate;
    if (receiptUrl !== undefined) updates.receipt_url = receiptUrl;

    const { data: expense, error } = await supabase
      .from('expenses')
      .update(updates)
      .eq('id', id)
      .eq('employee_id', req.user.id)
      .eq('status', 'pending')
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({
      id: expense.id,
      companyId: expense.company_id,
      employeeId: expense.employee_id,
      employeeName: req.user.full_name,
      amount: parseFloat(expense.amount),
      currency: expense.currency,
      amountInCompanyCurrency: parseFloat(expense.amount_in_company_currency),
      category: expense.category,
      description: expense.description,
      expenseDate: expense.expense_date,
      receiptUrl: expense.receipt_url,
      status: expense.status,
      currentApproverStep: expense.current_approver_step,
      createdAt: expense.created_at,
      updatedAt: expense.updated_at
    });
  } catch (error) {
    console.error('Update expense error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function deleteExpense(req, res) {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id)
      .eq('employee_id', req.user.id)
      .eq('status', 'pending');

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ message: 'Expense deleted successfully' });
  } catch (error) {
    console.error('Delete expense error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function scanReceipt(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const text = await extractTextFromImage(req.file.buffer);
    const expenseData = parseExpenseFromText(text);

    return res.status(200).json(expenseData);
  } catch (error) {
    console.error('OCR error:', error);
    return res.status(500).json({ error: 'Failed to scan receipt' });
  }
}
