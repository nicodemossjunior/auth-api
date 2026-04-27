import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Input from '../components/Input';
import Button from '../components/Button';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  
  const { register, loading, error } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.firstName) {
      newErrors.firstName = 'Nome é obrigatório';
    } else if (formData.firstName.length < 2) {
      newErrors.firstName = 'Nome deve ter pelo menos 2 caracteres';
    }
    
    if (!formData.lastName) {
      newErrors.lastName = 'Sobrenome é obrigatório';
    } else if (formData.lastName.length < 2) {
      newErrors.lastName = 'Sobrenome deve ter pelo menos 2 caracteres';
    }
    
    if (!formData.email) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }
    
    if (!formData.password) {
      newErrors.password = 'Senha é obrigatória';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirmação de senha é obrigatória';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Senhas não coincidem';
    }
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    try {
      await register(
        formData.firstName, 
        formData.lastName, 
        formData.email, 
        formData.password
      );
      navigate('/dashboard');
    } catch (error) {
      console.error('Register error:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full slide-up">
        <div className="card">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">
              Criar nova conta
            </h2>
            <p className="text-white/80">
              Junte-se a nós hoje mesmo
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Nome"
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="João"
                error={errors.firstName}
                required
                autoComplete="given-name"
              />
              
              <Input
                label="Sobrenome"
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Silva"
                error={errors.lastName}
                required
                autoComplete="family-name"
              />
            </div>
            
            <Input
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="seu@email.com"
              error={errors.email}
              required
              autoComplete="email"
            />
            
            <Input
              label="Senha"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              error={errors.password}
              required
              autoComplete="new-password"
            />
            
            <Input
              label="Confirmar Senha"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              error={errors.confirmPassword}
              required
              autoComplete="new-password"
            />

            {error && (
              <div className="alert alert-error fade-in">
                <svg 
                  className="w-5 h-5 flex-shrink-0" 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 20 20" 
                  fill="currentColor"
                >
                  <path 
                    fillRule="evenodd" 
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" 
                    clipRule="evenodd" 
                  />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <Button
              type="submit"
              loading={loading}
              disabled={loading}
              className="btn-full"
            >
              Criar Conta
            </Button>
          </form>
          
          <div className="text-center mt-6">
            <p className="text-white/80 text-sm">
              Já tem uma conta?{' '}
              <Link 
                to="/login" 
                className="text-white hover:text-white font-medium transition-colors"
              >
                Faça login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
