import { supabase } from '../config/supabase.js';

export async function signup(req, res) {
  try {
    const { email, password, fullName, country, currency } = req.body;

    if (!email || !password || !fullName || !country || !currency) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password
    });

    if (authError) {
      return res.status(400).json({ error: authError.message });
    }

    const { data: company, error: companyError } = await supabase
      .from('companies')
      .insert({
        name: `${fullName}'s Company`,
        currency,
        country
      })
      .select()
      .single();

    if (companyError) {
      return res.status(500).json({ error: 'Failed to create company' });
    }

    const { data: user, error: userError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        company_id: company.id,
        email,
        full_name: fullName,
        role: 'admin',
        is_manager_approver: false
      })
      .select()
      .single();

    if (userError) {
      return res.status(500).json({ error: 'Failed to create user' });
    }

    return res.status(201).json({
      user,
      company,
      session: authData.session
    });
  } catch (error) {
    console.error('Signup error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (authError) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*, companies(*)')
      .eq('id', authData.user.id)
      .single();

    if (userError) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.status(200).json({
      user: {
        id: user.id,
        companyId: user.company_id,
        email: user.email,
        fullName: user.full_name,
        role: user.role,
        managerId: user.manager_id,
        isManagerApprover: user.is_manager_approver,
        createdAt: user.created_at,
        updatedAt: user.updated_at
      },
      company: {
        id: user.companies.id,
        name: user.companies.name,
        currency: user.companies.currency,
        country: user.companies.country,
        createdAt: user.companies.created_at,
        updatedAt: user.companies.updated_at
      },
      session: authData.session
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function logout(req, res) {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getCurrentUser(req, res) {
  try {
    return res.status(200).json({
      user: req.user,
      company: req.company
    });
  } catch (error) {
    console.error('Get current user error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
