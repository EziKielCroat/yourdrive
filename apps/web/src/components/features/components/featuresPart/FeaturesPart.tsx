import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import {
  FeaturesSection,
  FeaturesContainer,
  SectionHeader,
  SectionLabel,
  SectionTitle,
  SectionDescription,
  FeaturesGrid,
  FeatureCard,
  FeatureImageContainer,
  FeatureImage,
  FeatureBadge,
  FeatureTitle,
  FeatureDescription,
  SupportGrid,
  SupportItem,
  SupportIcon,
  SupportTitle,
  SupportDescription
} from './styles/featuresPart';

const FeaturesPart: React.FC = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const features = [
    {
      title: 'Drag & Drop Upload',
      description: 'Effortlessly upload files with intuitive drag-and-drop. Large files? No problem—our chunked upload system handles them smoothly with resume capability if interrupted.',
      badge: null,
      icon: (
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
      ),
      iconBg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    {
      title: 'Smart Organization',
      description: 'Organize with nested folders, bulk operations for multiple files, and lightning-fast search by name. Your files, perfectly structured.',
      badge: null,
      icon: (
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
        </svg>
      ),
      iconBg: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
    },
    {
      title: 'Instant Sharing',
      description: 'Generate secure share links in seconds with optional password protection, expiration dates, and download limits. Share once or unlimited times—your choice.',
      badge: null,
      icon: (
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="18" cy="5" r="3" />
          <circle cx="6" cy="12" r="3" />
          <circle cx="18" cy="19" r="3" />
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
        </svg>
      ),
      iconBg: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
    },
    {
      title: 'Built-in Editing',
      description: 'Edit text files, annotate images, and view PDFs—all within your browser. Auto-save keeps your work safe with complete version comparison.',
      badge: null,
      icon: (
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
      ),
      iconBg: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
    },
    {
      title: 'Privacy First',
      description: 'End-to-end encryption for sensitive files, encrypted filenames, and zero telemetry. Your data stays yours with audit logs showing every access.',
      badge: 'SECURE',
      icon: (
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      ),
      iconBg: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
    },
    {
      title: 'Multi-Device Access',
      description: 'Access from any device with automatic sync. Offline mode available with selective folder synchronization for optimal storage management.',
      badge: null,
      icon: (
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
        </svg>
      ),
      iconBg: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)'
    }
  ];

  const support = [
    {
      icon: (
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="3" width="20" height="14" rx="2" />
          <path d="M8 21h8" />
          <path d="M12 17v4" />
        </svg>
      ),
      title: 'Easy Self-Hosting',
      description: 'Deploy in minutes on your own hardware. SQLite for simple setups, PostgreSQL for scaling—all with built-in backup systems.'
    },
    {
      icon: (
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      ),
      title: 'Zero-Knowledge Architecture',
      description: 'End-to-end encryption means we can\'t access your files even if we wanted to. Your encryption keys never leave your device.'
    },
    {
      icon: (
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
      title: 'Team Collaboration',
      description: 'Shared folders with role-based access, real-time presence indicators, and activity feeds to keep everyone in sync.'
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <FeaturesSection>
      <FeaturesContainer>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <SectionHeader>
            <SectionLabel>CORE FEATURES</SectionLabel>
            <SectionTitle>Everything you need, nothing you don't</SectionTitle>
            <SectionDescription>
              Built for speed and simplicity. Nexa delivers powerful file management 
              without the bloat—fast uploads, smart organization, and bulletproof privacy.
            </SectionDescription>
          </SectionHeader>
        </motion.div>

        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          <FeaturesGrid>
            {features.map((feature, index) => (
              <motion.div key={index} variants={itemVariants}>
                <FeatureCard>
                  <FeatureImageContainer>
                    {feature.badge && <FeatureBadge>{feature.badge}</FeatureBadge>}
                    <div 
                      style={{ 
                        width: '80px',
                        height: '80px',
                        borderRadius: '50%',
                        background: feature.iconBg,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      {feature.icon}
                    </div>
                  </FeatureImageContainer>
                  <FeatureTitle>{feature.title}</FeatureTitle>
                  <FeatureDescription>{feature.description}</FeatureDescription>
                </FeatureCard>
              </motion.div>
            ))}
          </FeaturesGrid>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <SupportGrid>
            {support.map((item, index) => (
              <SupportItem key={index}>
                <SupportIcon style={{ color: '#1F9AFE' }}>
                  {item.icon}
                </SupportIcon>
                <SupportTitle>{item.title}</SupportTitle>
                <SupportDescription>{item.description}</SupportDescription>
              </SupportItem>
            ))}
          </SupportGrid>
        </motion.div>
      </FeaturesContainer>
    </FeaturesSection>
  );
};

export default FeaturesPart;