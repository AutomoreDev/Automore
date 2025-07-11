// frontend/src/components/auth/SignupForm/SignupForm.tsx
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
  StepLabel,
  Alert
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
  phoneNumber: yup.string().required('Phone number is required').matches(/^\+27[0-9]{9}$/, 'Enter valid SA phone number (+27 followed by 9 digits, e.g., +27821234567)'),
  userType: yup.string().oneOf(['BUSINESS_USER', 'CLIENT_USER']).required('Please select account type'),
  companyName: yup.string().when('userType', {
    is: 'BUSINESS_USER',
    then: (schema) => schema.required('Company name is required for business accounts'),
    otherwise: (schema) => schema.notRequired()
  })
});

type RegisterFormData = yup.InferType<typeof schema>;

const steps = ['Account Type', 'Personal Details', 'Account Setup'];

export const SignupForm: React.FC = () => {
  const navigate = useNavigate();
  const { register: registerUser, loading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors, isValid },
    trigger,
    setError,
  } = useForm<RegisterFormData>({
    resolver: yupResolver(schema) as any,
    mode: 'onChange'
  });

  const userType = watch('userType');

  const handleNext = async () => {
    let fieldsToValidate: (keyof RegisterFormData)[] = [];
    
    switch (activeStep) {
      case 0:
        fieldsToValidate = ['userType'];
        break;
      case 1:
        fieldsToValidate = ['firstName', 'lastName', 'email', 'phoneNumber'];
        if (userType === 'BUSINESS_USER') {
          fieldsToValidate.push('companyName');
        }
        break;
      case 2:
        fieldsToValidate = ['password', 'confirmPassword'];
        break;
    }

    const isStepValid = await trigger(fieldsToValidate);
    if (isStepValid) {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setSubmitError(null);
      
      // Send all required fields that match your backend validation
      const registerData = {
        email: data.email,
        password: data.password,
        confirmPassword: data.confirmPassword, // ✅ ADD THIS - required by backend
        firstName: data.firstName,
        lastName: data.lastName,
        phoneNumber: data.phoneNumber,
        userType: data.userType as 'BUSINESS_USER' | 'CLIENT_USER',
        companyName: data.companyName || undefined
      };

      console.log('Sending registration data:', registerData); // Debug log

      const success = await registerUser(registerData);
      
      if (success) {
        navigate('/dashboard', { replace: true });
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      
      // Handle different types of errors
      if (error.response?.data?.errors) {
        // Backend validation errors
        const backendErrors = error.response.data.errors;
        setSubmitError(`Validation errors: ${backendErrors.map((e: any) => e.message).join(', ')}`);
        
        // Set specific field errors
        backendErrors.forEach((err: any) => {
          if (err.field) {
            setError(err.field as keyof RegisterFormData, {
              type: 'manual',
              message: err.message
            });
          }
        });
      } else if (error.response?.data?.message) {
        setSubmitError(error.response.data.message);
      } else {
        setSubmitError(error.message || 'Registration failed. Please try again.');
      }
    }
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Select your account type
            </Typography>
            <Controller
              name="userType"
              control={control}
              render={({ field }) => (
                <FormControl component="fieldset" error={!!errors.userType}>
                  <RadioGroup
                    {...field}
                    sx={{ mt: 2 }}
                  >
                    <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
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
                                For companies offering automation services
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
                                For businesses seeking automation solutions
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
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person color="action" />
                    </InputAdornment>
                  ),
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
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email color="action" />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              {...register('phoneNumber')}
              fullWidth
              label="Phone Number"
              placeholder="+27821234567"
              error={!!errors.phoneNumber}
              helperText={errors.phoneNumber?.message || "Format: +27 followed by 9 digits (e.g., +27821234567)"}
              sx={{ mb: 2 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Phone color="action" />
                  </InputAdornment>
                ),
              }}
            />

            {userType === 'BUSINESS_USER' && (
              <TextField
                {...register('companyName')}
                fullWidth
                label="Company Name"
                error={!!errors.companyName}
                helperText={errors.companyName?.message}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Business color="action" />
                    </InputAdornment>
                  ),
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
              InputProps={{
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
              }}
            />

            <TextField
              {...register('confirmPassword')}
              fullWidth
              label="Confirm Password"
              type={showConfirmPassword ? 'text' : 'password'}
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword?.message}
              InputProps={{
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
              }}
            />
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Box sx={{ p: 4, maxWidth: 800, mx: 'auto' }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" align="center" gutterBottom>
          Create Your Account
        </Typography>
        
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <form onSubmit={handleSubmit(onSubmit as any)}>
          <Box sx={{ minHeight: 300, mb: 4 }}>
            {renderStepContent(activeStep)}
          </Box>

          {/* Error Display */}
          {submitError && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {submitError}
            </Alert>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button
              onClick={handleBack}
              disabled={activeStep === 0}
            >
              Back
            </Button>

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