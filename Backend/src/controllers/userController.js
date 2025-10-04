import { supabase } from '../config/supabase.js';

export async function getAllUsers(req, res) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('company_id', req.company.id)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    const users = data.map(user => ({
      id: user.id,
      companyId: user.company_id,
      email: user.email,
      fullName: user.full_name,
      role: user.role,
      managerId: user.manager_id,
      isManagerApprover: user.is_manager_approver,
      createdAt: user.created_at,
      updatedAt: user.updated_at
    }));

    return res.status(200).json(users);
  } catch (error) {
    console.error('Get users error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function createUser(req, res) {
  try {
    const { email, password, fullName, role, managerId, isManagerApprover } = req.body;

    if (!email || !password || !fullName || !role) {
      return res.status(400).json({ error: 'Required fields missing' });
    }

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password
    });

    if (authError) {
      return res.status(400).json({ error: authError.message });
    }

    const { data: user, error: userError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        company_id: req.company.id,
        email,
        full_name: fullName,
        role,
        manager_id: managerId || null,
        is_manager_approver: isManagerApprover || false
      })
      .select()
      .single();

    if (userError) {
      return res.status(500).json({ error: userError.message });
    }

    return res.status(201).json({
      id: user.id,
      companyId: user.company_id,
      email: user.email,
      fullName: user.full_name,
      role: user.role,
      managerId: user.manager_id,
      isManagerApprover: user.is_manager_approver,
      createdAt: user.created_at,
      updatedAt: user.updated_at
    });
  } catch (error) {
    console.error('Create user error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function updateUser(req, res) {
  try {
    const { id } = req.params;
    const { fullName, role, managerId, isManagerApprover } = req.body;

    const updates = {
      updated_at: new Date().toISOString()
    };

    if (fullName) updates.full_name = fullName;
    if (role) updates.role = role;
    if (managerId !== undefined) updates.manager_id = managerId;
    if (isManagerApprover !== undefined) updates.is_manager_approver = isManagerApprover;

    const { data: user, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .eq('company_id', req.company.id)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({
      id: user.id,
      companyId: user.company_id,
      email: user.email,
      fullName: user.full_name,
      role: user.role,
      managerId: user.manager_id,
      isManagerApprover: user.is_manager_approver,
      createdAt: user.created_at,
      updatedAt: user.updated_at
    });
  } catch (error) {
    console.error('Update user error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function deleteUser(req, res) {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id)
      .eq('company_id', req.company.id);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
