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
import { Header } from '../../components/common/Header/Header';

export const LandingPage: React.FC = () => {
  const theme = useTheme();

  const benefits = [
    {
      icon: <RocketLaunchIcon sx={{ fontSize: 48, color: theme.palette.primary.main }} />,
      title: 'Proven 85% Productivity Boost',
      description: 'Our Make.com automation solutions have delivered measurable 85% productivity increases for 312+ South African businesses across all industries.',
    },
    {
      icon: <TrendingUpIcon sx={{ fontSize: 48, color: theme.palette.primary.main }} />,
      title: 'Guaranteed 3.5x ROI',
      description: 'Join our growing network of 47 partner companies and 312 end clients who consistently achieve 3.5x return on investment within 6 months.',
    },
    {
      icon: <SettingsIcon sx={{ fontSize: 48, color: theme.palette.primary.main }} />,
      title: 'Make.com Integration Experts',
      description: 'Connect 1,400+ apps seamlessly with our certified Make.com specialists. From CRM to accounting systems - we automate it all.',
    },
    {
      icon: <SecurityIcon sx={{ fontSize: 48, color: theme.palette.primary.main }} />,
      title: 'Zero-Error Workflows',
      description: 'Eliminate costly human errors with bulletproof automated processes. Our clients report 99.8% accuracy rates in their automated workflows.',
    },
  ];

  return (
    <Box sx={{ 
      backgroundColor: theme.palette.background.default,
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header with Login/Signup */}
      <Header />
      
      {/* Main Content */}
      <Box sx={{ flex: 1 }}>
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
                variant="h6"
                sx={{
                  color: theme.palette.text.secondary,
                  mb: 4,
                  maxWidth: '700px',
                  mx: 'auto',
                  lineHeight: 1.6,
                }}
              >
                South Africa's leading Make.com automation specialists. We've helped 312+ businesses 
                achieve 85% productivity gains through custom workflow automation that connects 1,400+ apps seamlessly.
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
                  sx={{
                    px: 4,
                    py: 1.5,
                    fontSize: '1.1rem',
                    fontWeight: 600,
                  }}
                  onClick={() => window.open('https://calendar.app.google/n9gwu2EJh2h15nHLA', '_blank')}
                >
                  Schedule Free Discovery Call
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  sx={{
                    px: 4,
                    py: 1.5,
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    borderColor: theme.palette.primary.main,
                    color: theme.palette.primary.main,
                    '&:hover': {
                      backgroundColor: theme.palette.primary.main,
                      color: theme.palette.primary.contrastText,
                    },
                    position: 'relative',
                  }}
                  onClick={() => window.open('https://docs.google.com/forms/d/e/1FAIpQLSfYSlp8HDDw2vrqXmCf4N1LAWcdi4FkiEBMjTyr3ma9ctH2Sg/viewform?usp=header', '_blank')}
                >
                  Free Automation Assessment
                  <Box
                    sx={{
                      position: 'absolute',
                      top: -8,
                      right: -8,
                      bgcolor: theme.palette.secondary.main,
                      color: 'white',
                      borderRadius: '50px',
                      fontSize: '10px',
                      px: 1,
                      py: 0.5,
                      fontWeight: 'bold',
                    }}
                  >
                    FREE
                  </Box>
                </Button>
              </Box>
            </motion.div>
          </Box>
        </Container>

        {/* Benefits Section */}
        <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography
              variant="h2"
              sx={{
                color: theme.palette.text.primary,
                mb: 2,
                fontWeight: 600,
              }}
            >
              Trusted by 300+ South African Businesses
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: theme.palette.text.secondary,
                maxWidth: '700px',
                mx: 'auto',
                mb: 4,
              }}
            >
              Join the growing network of companies transforming their operations with Make.com automation solutions.
            </Typography>

            {/* Stats Row */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                gap: { xs: 2, md: 6 },
                flexWrap: 'wrap',
                mb: 4,
              }}
            >
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h3" sx={{ color: theme.palette.primary.main, fontWeight: 'bold' }}>
                  312+
                </Typography>
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                  Businesses Automated
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h3" sx={{ color: theme.palette.primary.main, fontWeight: 'bold' }}>
                  R485K
                </Typography>
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                  Monthly Revenue Processed
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h3" sx={{ color: theme.palette.primary.main, fontWeight: 'bold' }}>
                  99.2%
                </Typography>
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                  Platform Uptime
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h3" sx={{ color: theme.palette.primary.main, fontWeight: 'bold' }}>
                  1,400+
                </Typography>
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                  App Integrations
                </Typography>
              </Box>
            </Box>
          </Box>

          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
              '@media (min-width: 900px)': {
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: 4,
              },
            }}
          >
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
              >
                <Card
                  sx={{
                    height: '100%',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: `0 20px 40px rgba(99, 102, 241, 0.2)`,
                    },
                  }}
                >
                  <CardContent sx={{ p: 4, textAlign: 'center' }}>
                    <Box sx={{ mb: 3 }}>
                      {benefit.icon}
                    </Box>
                    <Typography
                      variant="h5"
                      sx={{
                        color: theme.palette.text.primary,
                        mb: 2,
                        fontWeight: 600,
                      }}
                    >
                      {benefit.title}
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        color: theme.palette.text.secondary,
                        lineHeight: 1.6,
                      }}
                    >
                      {benefit.description}
                    </Typography>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </Box>
        </Container>

        {/* Process Section */}
        <Box sx={{ py: { xs: 6, md: 10 }, backgroundColor: theme.palette.background.paper }}>
          <Container maxWidth="lg">
            <Box sx={{ textAlign: 'center', mb: 6 }}>
              <Typography
                variant="h2"
                sx={{
                  color: theme.palette.text.primary,
                  mb: 2,
                  fontWeight: 600,
                }}
              >
                Our Proven 4-Step Process
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  color: theme.palette.text.secondary,
                  maxWidth: '600px',
                  mx: 'auto',
                }}
              >
                From discovery to deployment, we ensure every automation delivers maximum ROI.
              </Typography>
            </Box>

            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
                '@media (min-width: 900px)': {
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: 4,
                },
              }}
            >
              {[
                {
                  step: '01',
                  title: 'Discovery & Assessment',
                  description: 'Free consultation to identify automation opportunities and calculate potential ROI for your specific workflows.',
                },
                {
                  step: '02',
                  title: 'Custom Solution Design',
                  description: 'Our Make.com experts design tailored automation workflows that integrate seamlessly with your existing systems.',
                },
                {
                  step: '03',
                  title: 'Implementation & Testing',
                  description: 'Rapid deployment with comprehensive testing to ensure 99.8% accuracy before going live in your business.',
                },
                {
                  step: '04',
                  title: 'Training & Optimization',
                  description: 'Team training and ongoing optimization to maximize your automation ROI and scale with your business growth.',
                },
              ].map((process, index) => (
                <motion.div
                  key={process.step}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 3,
                      p: 3,
                      borderRadius: 2,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        backgroundColor: theme.palette.action.hover,
                      },
                    }}
                  >
                    <Box
                      sx={{
                        width: 60,
                        height: 60,
                        borderRadius: '50%',
                        backgroundColor: theme.palette.primary.main,
                        color: theme.palette.primary.contrastText,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.2rem',
                        fontWeight: 'bold',
                        flexShrink: 0,
                      }}
                    >
                      {process.step}
                    </Box>
                    <Box>
                      <Typography
                        variant="h6"
                        sx={{
                          color: theme.palette.text.primary,
                          mb: 1,
                          fontWeight: 600,
                        }}
                      >
                        {process.title}
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{
                          color: theme.palette.text.secondary,
                          lineHeight: 1.6,
                        }}
                      >
                        {process.description}
                      </Typography>
                    </Box>
                  </Box>
                </motion.div>
              ))}
            </Box>
          </Container>
        </Box>

        {/* Social Proof Section */}
        <Container maxWidth="lg" sx={{ py: { xs: 6, md: 8 } }}>
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography
              variant="h2"
              sx={{
                color: theme.palette.text.primary,
                mb: 2,
                fontWeight: 600,
              }}
            >
              Trusted by Industry Leaders
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: theme.palette.text.secondary,
                maxWidth: '600px',
                mx: 'auto',
                mb: 4,
              }}
            >
              From small businesses to enterprise clients, see what our automation solutions have achieved.
            </Typography>
          </Box>

          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 3,
              '@media (min-width: 600px)': {
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: 4,
              },
              '@media (min-width: 900px)': {
                gridTemplateColumns: 'repeat(3, 1fr)',
              },
            }}
          >
            {[
              {
                company: 'Cape Town Consulting',
                result: '85% time savings',
                detail: '18 clients automated',
                revenue: 'R38,200 MRR',
              },
              {
                company: 'Digital Solutions SA',
                result: '3.5x ROI achieved',
                detail: '23 workflows automated',
                revenue: 'R45,600 MRR',
              },
              {
                company: 'JHB Tech Partners',
                result: '99.8% accuracy',
                detail: '15 systems integrated',
                revenue: 'R32,100 MRR',
              },
            ].map((testimonial, index) => (
              <motion.div
                key={testimonial.company}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
              >
                <Card
                  sx={{
                    height: '100%',
                    p: 3,
                    textAlign: 'center',
                    border: `1px solid ${theme.palette.primary.main}`,
                  }}
                >
                  <Typography
                    variant="h5"
                    sx={{
                      color: theme.palette.primary.main,
                      mb: 2,
                      fontWeight: 600,
                    }}
                  >
                    {testimonial.result}
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{
                      color: theme.palette.text.primary,
                      mb: 1,
                      fontWeight: 500,
                    }}
                  >
                    {testimonial.company}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: theme.palette.text.secondary,
                      mb: 1,
                    }}
                  >
                    {testimonial.detail}
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      color: theme.palette.secondary.main,
                      fontWeight: 600,
                    }}
                  >
                    {testimonial.revenue}
                  </Typography>
                </Card>
              </motion.div>
            ))}
          </Box>
        </Container>

        {/* CTA Section */}
        <Box
          sx={{
            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
            py: { xs: 6, md: 8 },
          }}
        >
          <Container maxWidth="md">
            <Box sx={{ textAlign: 'center' }}>
              <Typography
                variant="h3"
                sx={{
                  color: theme.palette.primary.contrastText,
                  mb: 2,
                  fontWeight: 600,
                }}
              >
                Ready for 85% Productivity Gains?
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  color: 'rgba(255, 255, 255, 0.9)',
                  mb: 4,
                  maxWidth: '600px',
                  mx: 'auto',
                }}
              >
                Join 312+ South African businesses already achieving 3.5x ROI through Make.com automation. 
                Start with a free discovery call or take our automation readiness assessment.
              </Typography>
              <Box sx={{ 
                display: 'flex', 
                gap: 2, 
                justifyContent: 'center',
                flexWrap: 'wrap'
              }}>
                <Button
                  variant="contained"
                  size="large"
                  sx={{
                    backgroundColor: theme.palette.background.paper,
                    color: theme.palette.primary.main,
                    px: 4,
                    py: 1.5,
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    '&:hover': {
                      backgroundColor: theme.palette.grey[100],
                      transform: 'translateY(-2px)',
                    },
                  }}
                  onClick={() => window.open('https://calendar.app.google/n9gwu2EJh2h15nHLA', '_blank')}
                >
                  Schedule Free Discovery Call
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  sx={{
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                    color: theme.palette.primary.contrastText,
                    px: 4,
                    py: 1.5,
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    '&:hover': {
                      borderColor: 'rgba(255, 255, 255, 0.8)',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    },
                  }}
                  onClick={() => window.open('https://docs.google.com/forms/d/e/1FAIpQLSfYSlp8HDDw2vrqXmCf4N1LAWcdi4FkiEBMjTyr3ma9ctH2Sg/viewform?usp=header', '_blank')}
                >
                  Take Free Assessment
                </Button>
              </Box>
            </Box>
          </Container>
        </Box>
      </Box>

      {/* Footer */}
      <Box
        sx={{
          backgroundColor: theme.palette.background.paper,
          borderTop: `1px solid ${theme.palette.divider}`,
          py: 6,
        }}
      >
        <Container maxWidth="lg">
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              justifyContent: 'space-between',
              gap: 4,
              mb: 4,
            }}
          >
            {/* Company Info */}
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="h5"
                sx={{
                  color: theme.palette.primary.main,
                  fontWeight: 600,
                  mb: 2,
                }}
              >
                Automore
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: theme.palette.text.secondary,
                  mb: 2,
                  maxWidth: 300,
                }}
              >
                South Africa's leading Make.com automation specialists. 
                Automate Everything. Grow Faster.
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: theme.palette.text.secondary,
                  mb: 1,
                }}
              >
                📧 discover.automore@gmail.com
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: theme.palette.text.secondary,
                  mb: 1,
                }}
              >
                🌍 Remote-First | South Africa
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: theme.palette.text.secondary,
                }}
              >
                🕒 Sat - Sun: 9:00 AM - 5:00 PM
              </Typography>
            </Box>

            {/* Quick Links */}
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="h6"
                sx={{
                  color: theme.palette.text.primary,
                  fontWeight: 600,
                  mb: 2,
                }}
              >
                Quick Links
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Button
                  sx={{
                    justifyContent: 'flex-start',
                    color: theme.palette.text.secondary,
                    textTransform: 'none',
                    p: 0,
                    minHeight: 'auto',
                    '&:hover': {
                      backgroundColor: 'transparent',
                      color: theme.palette.primary.main,
                    },
                  }}
                  onClick={() => window.open('https://calendar.app.google/n9gwu2EJh2h15nHLA', '_blank')}
                >
                  Schedule Discovery Call
                </Button>
                <Button
                  sx={{
                    justifyContent: 'flex-start',
                    color: theme.palette.text.secondary,
                    textTransform: 'none',
                    p: 0,
                    minHeight: 'auto',
                    '&:hover': {
                      backgroundColor: 'transparent',
                      color: theme.palette.primary.main,
                    },
                  }}
                  onClick={() => window.open('https://docs.google.com/forms/d/e/1FAIpQLSfYSlp8HDDw2vrqXmCf4N1LAWcdi4FkiEBMjTyr3ma9ctH2Sg/viewform?usp=header', '_blank')}
                >
                  Automation Assessment
                </Button>
                <Button
                  component={Link}
                  to="/auth/login"
                  sx={{
                    justifyContent: 'flex-start',
                    color: theme.palette.text.secondary,
                    textTransform: 'none',
                    p: 0,
                    minHeight: 'auto',
                    '&:hover': {
                      backgroundColor: 'transparent',
                      color: theme.palette.primary.main,
                    },
                  }}
                >
                  Client Portal Login
                </Button>
                <Button
                  component={Link}
                  to="/auth/signup"
                  sx={{
                    justifyContent: 'flex-start',
                    color: theme.palette.text.secondary,
                    textTransform: 'none',
                    p: 0,
                    minHeight: 'auto',
                    '&:hover': {
                      backgroundColor: 'transparent',
                      color: theme.palette.primary.main,
                    },
                  }}
                >
                  Partner Registration
                </Button>
              </Box>
            </Box>

            {/* Platform Stats */}
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="h6"
                sx={{
                  color: theme.palette.text.primary,
                  fontWeight: 600,
                  mb: 2,
                }}
              >
                Platform Stats
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                  🏢 47 Partner Companies
                </Typography>
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                  👥 312+ Businesses Automated
                </Typography>
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                  💰 R485K+ Monthly Revenue
                </Typography>
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                  ⚡ 99.2% Platform Uptime
                </Typography>
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                  🔗 1,400+ App Integrations
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Bottom Footer */}
          <Box
            sx={{
              borderTop: `1px solid ${theme.palette.divider}`,
              pt: 3,
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <Typography
              variant="body2"
              sx={{
                color: theme.palette.text.secondary,
                textAlign: { xs: 'center', sm: 'left' },
              }}
            >
              © 2025 Automore. All rights reserved. | Certified Make.com Partners
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                sx={{
                  color: theme.palette.text.secondary,
                  textTransform: 'none',
                  fontSize: '0.875rem',
                  p: 0,
                  minHeight: 'auto',
                  '&:hover': {
                    backgroundColor: 'transparent',
                    color: theme.palette.primary.main,
                  },
                }}
                onClick={() => window.open('https://x.com/Automore5334561', '_blank')}
              >
                Follow on X/Twitter
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

// Default export for easier importing
export default LandingPage;