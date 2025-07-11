import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  CircularProgress,
  Divider,
  IconButton,
  InputAdornment,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
  Stepper,
  Step,
  StepLabel
} from '@mui/material';
import { Visibility, VisibilityOff, Person, Email, Lock, Business, Phone } from '@mui/icons-material';
import { useAuth } from '../../../context/auth/AuthContext';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

const schema = yup.object({
  firstName: yup.string().required('First name is required'),
  lastName: yup.string().required('Last name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().min(8, 'Password must be at least 8 characters').required('Password is required'),
  confirmPassword: yup.string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required('Please confirm your password'),
  phoneNumber: yup.string().required('Phone number is required').matches(/^\+27[0-9]{9}$/, 'Enter valid SA phone number (+27xxxxxxxxx)'),
  userType: yup.string().oneOf(['BUSINESS_USER', 'CLIENT_USER']).required('Please select account type'),
  companyName: yup.string().when('userType', {
    is: 'BUSINESS_USER',
    then: (schema) => schema.required('Company name is required for business accounts'),
    otherwise: (schema) => schema.notRequired()
  })
});

type RegisterFormData = yup.InferType<typeof schema>;

const steps = ['Account Type', 'Personal Details', 'Account Setup'];

export const RegisterForm: React.FC = () => {
  const navigate = useNavigate();
  const { register: registerUser, loading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors, isValid },
    trigger
  } = useForm<RegisterFormData>({
    resolver: yupResolver(schema) as any,
    mode: 'onChange',
    defaultValues: {
      userType: 'BUSINESS_USER'
    }
  });

  const userType = watch('userType');

  const handleNext = async () => {
    const isStepValid = await trigger();
    if (isStepValid) {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const onSubmit = async (data: RegisterFormData) => {
    const success = await registerUser({
      ...data,
      phoneNumber: data.phoneNumber || undefined,
      companyName: data.companyName || undefined
    });
    
    if (success) {
      navigate('/dashboard');
    }
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              What type of account do you need?
            </Typography>
            <Controller
              name="userType"
              control={control}
              render={({ field }) => (
                <FormControl component="fieldset" sx={{ mt: 2 }}>
                  <RadioGroup {...field} row>
                    <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                      <Paper
                        elevation={field.value === 'BUSINESS_USER' ? 3 : 1}
                        sx={{
                          p: 3,
                          cursor: 'pointer',
                          border: field.value === 'BUSINESS_USER' ? 2 : 1,
                          borderColor: field.value === 'BUSINESS_USER' ? 'primary.main' : 'grey.300',
                          minWidth: 200
                        }}
                        onClick={() => field.onChange('BUSINESS_USER')}
                      >
                        <FormControlLabel
                          value="BUSINESS_USER"
                          control={<Radio />}
                          label={
                            <Box sx={{ textAlign: 'left' }}>
                              <Typography variant="h6">Business Account</Typography>
                              <Typography variant="body2" color="text.secondary">
                                Manage clients, projects, and invoices
                              </Typography>
                            </Box>
                          }
                        />
                      </Paper>
                      <Paper
                        elevation={field.value === 'CLIENT_USER' ? 3 : 1}
                        sx={{
                          p: 3,
                          cursor: 'pointer',
                          border: field.value === 'CLIENT_USER' ? 2 : 1,
                          borderColor: field.value === 'CLIENT_USER' ? 'primary.main' : 'grey.300',
                          minWidth: 200
                        }}
                        onClick={() => field.onChange('CLIENT_USER')}
                      >
                        <FormControlLabel
                          value="CLIENT_USER"
                          control={<Radio />}
                          label={
                            <Box sx={{ textAlign: 'left' }}>
                              <Typography variant="h6">Client Account</Typography>
                              <Typography variant="body2" color="text.secondary">
                                Track projects and manage tickets
                              </Typography>
                            </Box>
                          }
                        />
                      </Paper>
                    </Box>
                  </RadioGroup>
                </FormControl>
              )}
            />
          </Box>
        );

      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Tell us about yourself
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <TextField
                {...register('firstName')}
                fullWidth
                label="First Name"
                error={!!errors.firstName}
                helperText={errors.firstName?.message}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person color="action" />
                      </InputAdornment>
                    ),
                  },
                }}
              />
              <TextField
                {...register('lastName')}
                fullWidth
                label="Last Name"
                error={!!errors.lastName}
                helperText={errors.lastName?.message}
              />
            </Box>

            <TextField
              {...register('email')}
              fullWidth
              label="Email Address"
              type="email"
              error={!!errors.email}
              helperText={errors.email?.message}
              sx={{ mb: 2 }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email color="action" />
                    </InputAdornment>
                  ),
                },
              }}
            />

            <TextField
              {...register('phoneNumber')}
              fullWidth
              label="Phone Number"
              placeholder="+27821234567"
              error={!!errors.phoneNumber}
              helperText={errors.phoneNumber?.message || "South African format: +27xxxxxxxxx"}
              sx={{ mb: 2 }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Phone color="action" />
                    </InputAdornment>
                  ),
                },
              }}
            />

            {userType === 'BUSINESS_USER' && (
              <TextField
                {...register('companyName')}
                fullWidth
                label="Company Name"
                error={!!errors.companyName}
                helperText={errors.companyName?.message}
                sx={{ mb: 2 }}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <Business color="action" />
                      </InputAdornment>
                    ),
                  },
                }}
              />
            )}
          </Box>
        );

      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Create your password
            </Typography>
            <TextField
              {...register('password')}
              fullWidth
              label="Password"
              type={showPassword ? 'text' : 'password'}
              error={!!errors.password}
              helperText={errors.password?.message}
              sx={{ mb: 2 }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />

            <TextField
              {...register('confirmPassword')}
              fullWidth
              label="Confirm Password"
              type={showConfirmPassword ? 'text' : 'password'}
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword?.message}
              sx={{ mb: 2 }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        edge="end"
                      >
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        p: 2
      }}
    >
      <Paper
        elevation={24}
        sx={{
          p: 4,
          width: '100%',
          maxWidth: 600,
          borderRadius: 3
        }}
      >
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography variant="h4" fontWeight="bold" color="primary" gutterBottom>
            Join Automore
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Create your account in just a few steps
          </Typography>
        </Box>

        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <form onSubmit={handleSubmit(onSubmit as any)} noValidate>
          {renderStepContent(activeStep)}

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
              sx={{ mr: 1 }}
            >
              Back
            </Button>
            <Box sx={{ flex: '1 1 auto' }} />
            {activeStep === steps.length - 1 ? (
              <Button
                type="submit"
                variant="contained"
                disabled={loading || !isValid}
                sx={{ minWidth: 120 }}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  'Create Account'
                )}
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleNext}
                sx={{ minWidth: 120 }}
              >
                Next
              </Button>
            )}
          </Box>
        </form>

        <Divider sx={{ my: 3 }} />

        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Already have an account?{' '}
            <Link to="/auth/login">
              <Typography component="span" color="primary" fontWeight="bold">
                Sign in here
              </Typography>
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};