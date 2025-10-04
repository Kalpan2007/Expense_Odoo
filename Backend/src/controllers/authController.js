import { supabase } from '../config/supabase.js';

export async function signup(req, res) {
  try {
    const { email, password, fullName, country, currency } = req.body;

    if (!email || !password || !fullName || !country || !currency) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if Supabase is configured
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
      return res.status(500).json({ 
        error: 'Server configuration error. Please check Supabase environment variables.' 
      });
    }

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName
        }
      }
    });

    if (authError) {
      console.error('Signup auth error:', authError);
      return res.status(400).json({ error: authError.message });
    }

    if (!authData.user) {
      return res.status(400).json({ error: 'Failed to create user account' });
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
      console.error('Company creation error:', companyError);
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
      console.error('User creation error:', userError);
      return res.status(500).json({ error: 'Failed to create user profile' });
    }

    return res.status(201).json({
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
        id: company.id,
        name: company.name,
        currency: company.currency,
        country: company.country,
        createdAt: company.created_at,
        updatedAt: company.updated_at
      },
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

    // Check if Supabase is configured
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
      return res.status(500).json({ 
        error: 'Server configuration error. Please check Supabase environment variables.' 
      });
    }

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (authError) {
      console.error('Auth error:', authError);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!authData.user) {
      return res.status(401).json({ error: 'Authentication failed' });
    }

    // Check if user exists in our database
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*, companies(*)')
      .eq('id', authData.user.id)
      .single();

    if (userError) {
      console.error('User lookup error:', userError);
      
      // If user doesn't exist, create a default company and user
      if (userError.code === 'PGRST116') {
        try {
          // Create a default company for this user
          const { data: company, error: companyError } = await supabase
            .from('companies')
            .insert({
              name: `${authData.user.email}'s Company`,
              currency: 'USD',
              country: 'US'
            })
            .select()
            .single();

          if (companyError) {
            console.error('Company creation error:', companyError);
            return res.status(500).json({ error: 'Failed to create user profile' });
          }

          // Create user profile
          const { data: newUser, error: newUserError } = await supabase
            .from('users')
            .insert({
              id: authData.user.id,
              company_id: company.id,
              email: authData.user.email,
              full_name: authData.user.user_metadata?.full_name || authData.user.email,
              role: 'admin',
              is_manager_approver: false
            })
            .select()
            .single();

          if (newUserError) {
            console.error('User creation error:', newUserError);
            return res.status(500).json({ error: 'Failed to create user profile' });
          }

          return res.status(200).json({
            user: {
              id: newUser.id,
              companyId: newUser.company_id,
              email: newUser.email,
              fullName: newUser.full_name,
              role: newUser.role,
              managerId: newUser.manager_id,
              isManagerApprover: newUser.is_manager_approver,
              createdAt: newUser.created_at,
              updatedAt: newUser.updated_at
            },
            company: {
              id: company.id,
              name: company.name,
              currency: company.currency,
              country: company.country,
              createdAt: company.created_at,
              updatedAt: company.updated_at
            },
            session: authData.session
          });
        } catch (createError) {
          console.error('User creation failed:', createError);
          return res.status(500).json({ error: 'Failed to create user profile' });
        }
      }
      
      return res.status(500).json({ error: 'Database error. Please ensure the database is properly initialized.' });
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
