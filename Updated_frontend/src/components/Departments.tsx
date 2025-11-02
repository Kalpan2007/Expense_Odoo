import { useState, useEffect } from 'react';
import { Plus, CreditCard as Edit2, Trash2, Building, Users, DollarSign, User } from 'lucide-react';
import { Department } from '../types';
import { useUsers } from '../hooks/useUsers';

const Departments = () => {
  const { getCompanyUsers } = useUsers();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    managerId: '',
    budget: ''
  });

  const companyUsers = getCompanyUsers();
  const managers = companyUsers.filter(u => u.role === 'manager' || u.role === 'admin');

  useEffect(() => {
    loadDepartments();
  }, []);

  const loadDepartments = () => {
    const savedDepartments = JSON.parse(localStorage.getItem('departments') || '[]');
    setDepartments(savedDepartments);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const departmentData = {
      ...formData,
      budget: formData.budget ? parseFloat(formData.budget) : undefined,
      managerId: formData.managerId || undefined,
      isActive: true
    };

    if (editingDepartment) {
      const updatedDepartments = departments.map(d => 
        d.id === editingDepartment.id ? { ...d, ...departmentData } : d
      );
      setDepartments(updatedDepartments);
      localStorage.setItem('departments', JSON.stringify(updatedDepartments));
      setEditingDepartment(null);
    } else {
      const newDepartment: Department = {
        ...departmentData,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString()
      };
      const updatedDepartments = [...departments, newDepartment];
      setDepartments(updatedDepartments);
      localStorage.setItem('departments', JSON.stringify(updatedDepartments));
      setShowCreateModal(false);
    }

    setFormData({
      name: '',
      managerId: '',
      budget: ''
    });
  };

  const handleEdit = (department: Department) => {
    setEditingDepartment(department);
    setFormData({
      name: department.name,
      managerId: department.managerId || '',
      budget: department.budget?.toString() || ''
    });
  };

  const handleDelete = (departmentId: string) => {
    if (confirm('Are you sure you want to delete this department?')) {
      const updatedDepartments = departments.filter(d => d.id !== departmentId);
      setDepartments(updatedDepartments);
      localStorage.setItem('departments', JSON.stringify(updatedDepartments));
    }
  };

  const toggleDepartmentStatus = (departmentId: string) => {
    const updatedDepartments = departments.map(d => 
      d.id === departmentId ? { ...d, isActive: !d.isActive } : d
    );
    setDepartments(updatedDepartments);
    localStorage.setItem('departments', JSON.stringify(updatedDepartments));
  };

  const getDepartmentEmployeeCount = (departmentName: string) => {
    return companyUsers.filter(u => u.department === departmentName).length;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Department Management</h2>
              <p className="text-gray-600 mt-1">Organize your company structure and manage department budgets</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-md"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Department
            </button>
          </div>
        </div>

        {/* Department Stats */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-600 text-sm font-medium">Total Departments</p>
                  <p className="text-2xl font-bold text-blue-900">{departments.length}</p>
                </div>
                <Building className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-600 text-sm font-medium">Active Departments</p>
                  <p className="text-2xl font-bold text-green-900">{departments.filter(d => d.isActive).length}</p>
                </div>
                <Building className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-600 text-sm font-medium">Total Employees</p>
                  <p className="text-2xl font-bold text-purple-900">{companyUsers.length}</p>
                </div>
                <Users className="w-8 h-8 text-purple-600" />
              </div>
            </div>
            <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-600 text-sm font-medium">Total Budget</p>
                  <p className="text-2xl font-bold text-yellow-900">
                    ${departments.reduce((sum, d) => sum + (d.budget || 0), 0).toLocaleString()}
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-yellow-600" />
              </div>
            </div>
          </div>

          {/* Departments Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {departments.map((department) => {
              const manager = department.managerId ? companyUsers.find(u => u.id === department.managerId) : null;
              const employeeCount = getDepartmentEmployeeCount(department.name);
              
              return (
                <div key={department.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{department.name}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          department.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {department.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => toggleDepartmentStatus(department.id)}
                        className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                          department.isActive 
                            ? 'text-red-600 hover:bg-red-50' 
                            : 'text-green-600 hover:bg-green-50'
                        }`}
                      >
                        {department.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => handleEdit(department)}
                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(department.id)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 flex items-center">
                        <User className="w-4 h-4 mr-1" />
                        Manager:
                      </span>
                      <span className="font-medium text-gray-900">
                        {manager ? manager.name : 'No manager assigned'}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        Employees:
                      </span>
                      <span className="font-medium text-gray-900">{employeeCount}</span>
                    </div>

                    {department.budget && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 flex items-center">
                          <DollarSign className="w-4 h-4 mr-1" />
                          Budget:
                        </span>
                        <span className="font-semibold text-gray-900">${department.budget.toLocaleString()}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Created:</span>
                      <span className="text-gray-900">{new Date(department.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              );
            })}

            {departments.length === 0 && (
              <div className="col-span-full text-center py-12">
                <Building className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No departments created yet</p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
                >
                  Create your first department
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create/Edit Department Modal */}
      {(showCreateModal || editingDepartment) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {editingDepartment ? 'Edit Department' : 'Create New Department'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Sales, Marketing, IT"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department Manager (Optional)</label>
                <select
                  name="managerId"
                  value={formData.managerId}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">No manager assigned</option>
                  {managers.map(manager => (
                    <option key={manager.id} value={manager.id}>
                      {manager.name} ({manager.role})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department Budget (Optional)</label>
                <input
                  type="number"
                  name="budget"
                  value={formData.budget}
                  onChange={handleInputChange}
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 px-4 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all"
                >
                  {editingDepartment ? 'Update Department' : 'Create Department'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingDepartment(null);
                    setFormData({
                      name: '',
                      managerId: '',
                      budget: ''
                    });
                  }}
                  className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Departments;