import React from 'react';
import {
  Box,
  Typography,
  Button,
  Container,
  Card,
  CardContent,
  useTheme,
} from '@mui/material';
import { motion } from 'framer-motion';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SettingsIcon from '@mui/icons-material/Settings';
import SecurityIcon from '@mui/icons-material/Security';
import { Link } from 'react-router-dom';

export const LandingPage: React.FC = () => {
  const theme = useTheme();

  const benefits = [
    {
      icon: <RocketLaunchIcon sx={{ fontSize: 48, color: theme.palette.primary.main }} />,
      title: 'Boost Productivity',
      description: 'Automate repetitive tasks and workflows to increase your team\'s productivity by up to 85%.',
    },
    {
      icon: <TrendingUpIcon sx={{ fontSize: 48, color: theme.palette.primary.main }} />,
      title: 'Maximize ROI',
      description: 'Clients typically see a 3.5x return on investment through reduced costs and increased efficiency.',
    },
    {
      icon: <SettingsIcon sx={{ fontSize: 48, color: theme.palette.primary.main }} />,
      title: 'Custom Solutions',
      description: 'We build automation solutions tailored specifically to your unique business processes and needs.',
    },
    {
      icon: <SecurityIcon sx={{ fontSize: 48, color: theme.palette.primary.main }} />,
      title: 'Reduce Errors',
      description: 'Eliminate human errors and ensure consistent, reliable processes across your organization.',
    },
  ];

  return (
    <Box sx={{ 
      backgroundColor: theme.palette.background.default,
      minHeight: '100vh'
    }}>
      {/* Hero Section */}
      <Container maxWidth="lg">
        <Box
          sx={{
            textAlign: 'center',
            py: { xs: 8, md: 12 },
            px: { xs: 2, sm: 3 },
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            <Typography
              variant="h1"
              sx={{
                color: theme.palette.primary.main,
                mb: 3,
                textAlign: 'center',
              }}
            >
              Automore
            </Typography>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
          >
            <Typography
              variant="h3"
              sx={{
                color: theme.palette.text.primary,
                mb: 2,
                fontWeight: 400,
              }}
            >
              Work Smarter. Grow Faster.
            </Typography>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6 }}
          >
            <Typography
              variant="body1"
              sx={{
                color: theme.palette.text.secondary,
                mb: 4,
                maxWidth: 800,
                mx: 'auto',
                fontSize: '18px',
                lineHeight: 1.6,
              }}
            >
              We create custom automation solutions that eliminate manual tasks, reduce errors, 
              and free your team to focus on what matters most: growing your business.
            </Typography>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.9 }}
          >
            <Box sx={{ 
              display: 'flex', 
              gap: 2, 
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}>
              <Button
                variant="contained"
                size="large"
                component={Link}
                to="/auth/signup"
                sx={{ px: 4, py: 1.5 }}
              >
                Get Started
              </Button>
              <Button
                variant="outlined"
                size="large"
                sx={{ 
                  px: 4, 
                  py: 1.5,
                  borderColor: theme.palette.text.primary,
                  color: theme.palette.text.primary,
                  '&:hover': {
                    borderColor: theme.palette.primary.main,
                    backgroundColor: 'rgba(99, 102, 241, 0.1)',
                  }
                }}
              >
                Learn More
              </Button>
            </Box>
          </motion.div>
        </Box>

        {/* Benefits Section */}
        <Box sx={{ py: { xs: 6, md: 10 } }}>
          <Typography
            variant="h2"
            sx={{
              textAlign: 'center',
              mb: 6,
              color: theme.palette.text.primary,
            }}
          >
            Why Choose Automore
          </Typography>

          {/* Benefits Grid using Box with Flexbox - More reliable than MUI Grid */}
          <Box 
            sx={{ 
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(4, 1fr)'
              },
              gap: 4
            }}
          >
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card sx={{ 
                  height: '100%', 
                  textAlign: 'center',
                  p: 3,
                }}>
                  <CardContent>
                    <Box sx={{ mb: 2 }}>
                      {benefit.icon}
                    </Box>
                    <Typography
                      variant="h6"
                      sx={{ mb: 2, fontWeight: 600 }}
                    >
                      {benefit.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ 
                        color: theme.palette.text.secondary,
                        lineHeight: 1.6 
                      }}
                    >
                      {benefit.description}
                    </Typography>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </Box>
        </Box>
      </Container>
    </Box>
  );
};