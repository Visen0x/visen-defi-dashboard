import React, { useRef, useEffect, useState } from "react";
import "./App.css";
import Waves from "./blocks/Backgrounds/Waves/Waves";
import GlitchText from "./blocks/TextAnimations/GlitchText/GlitchText";
import DecryptedText from "./blocks/TextAnimations/DecryptedText/DecryptedText";
import BlobCursor from "./blocks/Animations/BlobCursor/BlobCursor";
import SpotlightCard from "./blocks/Components/SpotlightCard/SpotlightCard";
import AnimatedList from "./blocks/Components/AnimatedList/AnimatedList";
import FadeContent from "./blocks/Animations/FadeContent/FadeContent";
import ShinyText from "./blocks/TextAnimations/ShinyText/ShinyText";
import GradientText from "./blocks/TextAnimations/GradientText/GradientText";
import Magnet from "./blocks/Animations/Magnet/Magnet";
import GlareHover from "./blocks/Animations/GlareHover/GlareHover";
import AnimatedContent from "./blocks/Animations/AnimatedContent/AnimatedContent";
import newLogo from "./new.png";

const features = [
  { 
    title: "Agent Verification", 
    description: "Cryptographic proof of agent identity and authenticity through decentralized verification protocols.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1M12,7C13.4,7 14.8,8.6 14.8,10V11.5C15.4,11.5 16,12.4 16,13V16C16,17.4 15.4,18 14.8,18H9.2C8.6,18 8,17.4 8,16V13C8,12.4 8.6,11.5 9.2,11.5V10C9.2,8.6 10.6,7 12,7M12,8.2C11.2,8.2 10.5,8.7 10.5,10V11.5H13.5V10C13.5,8.7 12.8,8.2 12,8.2Z"/>
      </svg>
    ),
    gradient: "linear-gradient(135deg, #3AFF73 0%, #40ffaa 100%)"
  },
  { 
    title: "Signature-based Access Control", 
    description: "Multi-signature authorization system ensuring only verified entities can interact with your agents.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12,17A2,2 0 0,0 14,15C14,13.89 13.1,13 12,13A2,2 0 0,0 10,15A2,2 0 0,0 12,17M18,8A2,2 0 0,1 20,10V20A2,2 0 0,1 18,22H6A2,2 0 0,1 4,20V10C4,8.89 4.9,8 6,8H7V6A5,5 0 0,1 12,1A5,5 0 0,1 17,6V8H18M12,3A3,3 0 0,0 9,6V8H15V6A3,3 0 0,0 12,3Z"/>
      </svg>
    ),
    gradient: "linear-gradient(135deg, #40ffaa 0%, #3AFF73 100%)"
  },
  { 
    title: "Secure LLM Execution", 
    description: "Protected execution environment for AI models with encrypted computation and memory isolation.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M7,2V13H10V22L17,10H13L17,2H7Z"/>
      </svg>
    ),
    gradient: "linear-gradient(135deg, #3AFF73 0%, #2dd4bf 100%)"
  },
  { 
    title: "Trustless Task Coordination", 
    description: "Decentralized task management allowing autonomous agents to collaborate without central authority.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M11,14H9A1,1 0 0,1 8,13V10A1,1 0 0,1 9,9H11V7.5A2.5,2.5 0 0,1 13.5,5A2.5,2.5 0 0,1 16,7.5V9H18A1,1 0 0,1 19,10V13A1,1 0 0,1 18,14H16V16.5A2.5,2.5 0 0,1 13.5,19A2.5,2.5 0 0,1 11,16.5V14M13,16.5A0.5,0.5 0 0,0 13.5,17A0.5,0.5 0 0,0 14,16.5V14H17V11H14V7.5A0.5,0.5 0 0,0 13.5,7A0.5,0.5 0 0,0 13,7.5V11H10V14H13V16.5Z"/>
      </svg>
    ),
    gradient: "linear-gradient(135deg, #2dd4bf 0%, #3AFF73 100%)"
  },
  { 
    title: "End-to-End Encryption", 
    description: "Complete data protection from agent communication to task execution using advanced cryptographic methods.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M6,8A2,2 0 0,1 8,6A2,2 0 0,1 10,8V10H6V8M18,8A2,2 0 0,1 20,6A2,2 0 0,1 22,8V10H18V8M22,10V20A2,2 0 0,1 20,22H4A2,2 0 0,1 2,20V10A2,2 0 0,1 4,8H6V8A4,4 0 0,1 10,4A4,4 0 0,1 14,8H16V8A4,4 0 0,1 20,4A4,4 0 0,1 24,8V10H22M8,12A1,1 0 0,1 9,11A1,1 0 0,1 10,12A1,1 0 0,1 9,13A1,1 0 0,1 8,12M16,12A1,1 0 0,1 17,11A1,1 0 0,1 18,12A1,1 0 0,1 17,13A1,1 0 0,1 16,12Z"/>
      </svg>
    ),
    gradient: "linear-gradient(135deg, #3AFF73 0%, #06d6a0 100%)"
  },
  { 
    title: "Real-time Monitoring", 
    description: "Continuous oversight and audit trails providing complete transparency of agent operations and decisions.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17M12,4.5C7,4.5 2.73,7.61 1,12C2.73,16.39 7,19.5 12,19.5C17,19.5 21.27,16.39 23,12C21.27,7.61 17,4.5 12,4.5Z"/>
      </svg>
    ),
    gradient: "linear-gradient(135deg, #06d6a0 0%, #3AFF73 100%)"
  },
];

const howSteps = [
  {
    title: "Connect your agents or dApps",
    description: "Seamlessly integrate your autonomous AI agents or decentralized applications into the Visen AI security framework through our comprehensive SDK and API endpoints."
  },
  {
    title: "Configure access and verification",
    description: "Set up multi-layered security protocols including signature-based authentication, role-based permissions, and customizable verification workflows tailored to your specific use case."
  },
  {
    title: "Deploy and manage securely",
    description: "Launch your secured AI agents with real-time monitoring, automatic threat detection, and comprehensive audit trails that ensure complete transparency and compliance."
  },
];

const useCases = [
  {
    title: "AI Agent Coordination",
    summary: "Orchestrate multiple AI agents working together on complex tasks",
    description: "Enable seamless coordination between multiple autonomous AI agents, allowing them to collaborate on complex multi-step tasks while maintaining security and trust. Our platform provides the infrastructure for agents to communicate, share resources, and execute coordinated strategies without compromising individual agent integrity or exposing sensitive data.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12,2A2,2 0 0,1 14,4A2,2 0 0,1 12,6A2,2 0 0,1 10,4A2,2 0 0,1 12,2M21,9V7L15,1H5C3.89,1 3,1.89 3,3V7H9V9H3V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V9M7,15A2,2 0 0,1 9,17A2,2 0 0,1 7,19A2,2 0 0,1 5,17A2,2 0 0,1 7,15M17,15A2,2 0 0,1 19,17A2,2 0 0,1 17,19A2,2 0 0,1 15,17A2,2 0 0,1 17,15Z"/>
      </svg>
    )
  },
  {
    title: "Decentralized Data Processing",
    summary: "Secure distributed processing of sensitive data across networks",
    description: "Process large datasets across distributed networks while maintaining data privacy and security. Our decentralized approach ensures that sensitive information never leaves its secure environment while still enabling powerful collaborative analytics and machine learning across multiple parties and jurisdictions.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M4,6H20V16H4M20,18A2,2 0 0,0 22,16V6C22,4.89 21.1,4 20,4H4C2.89,4 2,4.89 2,6V16A2,2 0 0,0 4,18H0V20H24V18H20Z"/>
      </svg>
    )
  },
  {
    title: "Autonomous Market Makers",
    summary: "Self-managing DeFi protocols with AI-driven optimization",
    description: "Deploy intelligent automated market makers that can adapt to market conditions, optimize liquidity provision, and execute complex trading strategies autonomously. These AI-driven AMMs can rebalance portfolios, adjust fee structures, and implement risk management protocols without human intervention while maintaining complete transparency and auditability.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M7,15H9C9,16.08 9.37,17 10,17C10.63,17 11,16.08 11,15C11,13.92 10.63,13 10,13C9.37,13 9,12.08 9,11C9,9.92 9.37,9 10,9C10.63,9 11,9.92 11,11H13C13,8.79 11.21,7 9,7H8V5H6V7H5C2.79,7 1,8.79 1,11S2.79,15 5,15H6V17H8V15H7M16,17H18C20.21,17 22,15.21 22,13S20.21,9 18,9H17V7H15V9H14C11.79,9 10,10.79 10,13S11.79,17 14,17H15V19H17V17H16M16,15H14C13.45,15 13,14.55 13,14S13.45,13 14,13H16V15M18,11C18.55,11 19,11.45 19,12S18.55,13 18,13H17V11H18Z"/>
      </svg>
    )
  },
  {
    title: "Chain-of-Thought Logging",
    summary: "Complete audit trails of AI decision-making processes",
    description: "Maintain comprehensive, immutable records of AI agent decision-making processes and reasoning chains. Every step of an agent's thought process is cryptographically logged, creating transparent audit trails that enable regulatory compliance, debugging, and trust verification for critical AI applications in finance, healthcare, and governance.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
      </svg>
    )
  },
  {
    title: "Multi-Agent Governance",
    summary: "Decentralized decision-making with AI-powered consensus",
    description: "Implement sophisticated governance systems where multiple AI agents participate in decentralized decision-making processes. These systems can handle voting, proposal evaluation, resource allocation, and policy implementation across DAOs and decentralized organizations while ensuring fair representation and preventing manipulation or collusion.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17,10.5V7A1,1 0 0,0 16,6H4A1,1 0 0,0 3,7V10.5C3.5,10.5 4,10.86 4,11.5C4,12.14 3.5,12.5 3,12.5V16A1,1 0 0,0 4,17H16A1,1 0 0,0 17,16V12.5C16.5,12.5 16,12.14 16,11.5C16,10.86 16.5,10.5 17,10.5M21,9H19V15H21A1,1 0 0,0 22,14V10A1,1 0 0,0 21,9Z"/>
      </svg>
    )
  },
  {
    title: "Decentralized AI Training",
    summary: "Collaborative model training across distributed networks",
    description: "Enable secure, collaborative AI model training across multiple parties without sharing raw data. Our platform facilitates federated learning, differential privacy, and secure multi-party computation, allowing organizations to benefit from collective intelligence while maintaining data sovereignty and competitive advantages.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M12,6A6,6 0 0,0 6,12A6,6 0 0,0 12,18A6,6 0 0,0 18,12A6,6 0 0,0 12,6M12,8A4,4 0 0,1 16,12A4,4 0 0,1 12,16A4,4 0 0,1 8,12A4,4 0 0,1 12,8Z"/>
      </svg>
    )
  },
];

const footerLinks = [
  { section: "Product", links: ["Features", "How it Works", "Use Cases", "Documentation"] },
  { section: "Community", links: ["GitHub", "Twitter"] },
  { section: "Company", links: ["About", "Contact"] },
];



const App: React.FC = () => {
  const rootRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState(window.innerHeight);
  const [expandedStep, setExpandedStep] = useState<number | null>(null);
  const [expandedUseCase, setExpandedUseCase] = useState<number | null>(null);

  useEffect(() => {
    const updateHeight = () => {
      if (rootRef.current) {
        setContentHeight(rootRef.current.scrollHeight);
      }
    };
    updateHeight();
    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, []);

  const handleNavClick = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleStepClick = (index: number) => {
    setExpandedStep(expandedStep === index ? null : index);
  };

  const handleUseCaseClick = (index: number) => {
    setExpandedUseCase(expandedUseCase === index ? null : index);
  };

  return (
    <div
      className="visen-root"
      ref={rootRef}
      style={{ position: "relative", overflow: "visible", minHeight: "100vh" }}
    >
      {/* Navigation Bar */}
      <FadeContent duration={800} delay={100}>
      <nav className="visen-navbar">
          <div className="nav-logo">
            <img 
              src={newLogo} 
              alt="Visen AI" 
              className="nav-logo-image"
            />
          </div>
        <div className="nav-links">
            <a href="#features" onClick={() => handleNavClick("features")}>Features</a>
            <a href="#how" onClick={() => handleNavClick("how")}>How It Works</a>
            <a href="#usecases" onClick={() => handleNavClick("usecases")}>Use Cases</a>
          <a href="https://visen0x.gitbook.io/visen0x/" target="_blank" rel="noopener noreferrer">Docs</a>
            <a href="https://x.com/Visen_Ai" target="_blank" rel="noopener noreferrer">Twitter</a>
            <a href="/demo" className="nav-launch-btn">Launch App</a>
        </div>
      </nav>
      </FadeContent>

      {/* Animated Cursor */}
      <BlobCursor fillColor="#3AFF73" innerColor="#fff" zIndex={1000} />

      {/* Waves Background - UNTOUCHED */}
      <Waves
        waveSpeedX={0}
        waveSpeedY={0}
        lineColor="#222"
        backgroundColor="transparent"
        style={{
          zIndex: 0,
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          pointerEvents: "none",
        }}
      />

      <main style={{ position: "relative", zIndex: 1 }}>
        {/* Hero Section */}
        <section className="hero-section">
          <FadeContent duration={1200} delay={300}>
            <h1>
              <span style={{ color: "#fff", fontWeight: "bold" }}>Visen</span>
              <span style={{ margin: "0 1rem", color: "#3AFF73" }}>—</span>
              <ShinyText text="Secure Autonomy" speed={4} />
            </h1>
          </FadeContent>
          
          <FadeContent duration={1000} delay={600}>
          <h2 style={{ marginTop: 24, marginBottom: 32 }}>
            <DecryptedText
              text="A decentralized security layer for autonomous AI agents."
              speed={18}
              maxIterations={20}
              animateOn="view"
            />
          </h2>
          </FadeContent>

          <FadeContent duration={800} delay={900}>
          <div className="cta-buttons">
              <a href="https://visen0x.gitbook.io/visen0x/" target="_blank" rel="noopener noreferrer" className="cta neon">
                <GradientText colors={["#0a0a0a", "#1a1a1a"]} animationSpeed={3}>
                  Explore the Docs
                </GradientText>
              </a>
              <a href="/demo" className="cta outline">Launch App</a>
          </div>
          </FadeContent>
        </section>

        {/* Key Features Section */}
        <section className="features-section" id="features">
          <FadeContent duration={800} delay={100}>
            <h3 className="section-title">Key Features</h3>
          </FadeContent>
          
          <div className="features-grid">
            {features.map((feature, i) => (
              <FadeContent 
                key={feature.title} 
                duration={800}
                delay={200 + i * 100}
              >
                <div className="feature-item">
                  <Magnet 
                    padding={80} 
                    magnetStrength={8}
                    activeTransition="transform 0.3s ease-out"
                    inactiveTransition="transform 0.6s ease-in-out"
                  >
                    <GlareHover
                      width="100%"
                      height="100%"
                      background="rgba(20, 20, 20, 0.95)"
                      borderRadius="16px"
                      borderColor="rgba(58, 255, 115, 0.2)"
                      glareColor="#3AFF73"
                      glareOpacity={0.15}
                      glareSize={200}
                      transitionDuration={400}
                      className="feature-glare-card"
                    >
                      <div className="feature-card-enhanced">
                        <div className="feature-symbol-container">
                          <div 
                            className="feature-symbol"
                            style={{ background: feature.gradient }}
                          >
                            <div className="feature-icon">{feature.icon}</div>
                          </div>
                        </div>
                        
                        <div className="feature-content-enhanced">
                          <h4 className="feature-title-enhanced">
                            <ShinyText text={feature.title} speed={6} />
                          </h4>
                          <p className="feature-description-enhanced">
                            {feature.description}
                          </p>
                        </div>
                        
                        <div className="feature-accent-line"></div>
                      </div>
                    </GlareHover>
                  </Magnet>
                </div>
              </FadeContent>
            ))}
          </div>
        </section>

        {/* How It Works Section */}
        <section className="how-section" id="how">
          <FadeContent duration={800} delay={100}>
            <h3 className="section-title">How It Works</h3>
          </FadeContent>
          
          <FadeContent duration={1000} delay={300}>
            <div className="how-content">
              <div className="how-steps">
                {howSteps.map((step, index) => (
                  <div
                    key={index}
                    className={`how-step ${expandedStep === index ? 'expanded' : ''}`}
                    onClick={() => handleStepClick(index)}
                  >
                    <div className="step-header">
                      <span className="step-number">{index + 1}</span>
                      <h4 className="step-title">{step.title}</h4>
                      <span className="step-arrow">{expandedStep === index ? '−' : '+'}</span>
                    </div>
                    {expandedStep === index && (
                      <div className="step-description">
                        <p>{step.description}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </FadeContent>
        </section>

        {/* Use Cases Section */}
        <section className="usecases-section" id="usecases">
          <FadeContent duration={800} delay={100}>
            <h3 className="section-title">Use Cases</h3>
          </FadeContent>
          
          <div className="usecases-grid">
            {useCases.map((useCase, i) => (
              <FadeContent 
                key={i} 
                duration={800} 
                delay={200 + i * 120}
              >
                <div className="usecase-item">
                  <Magnet 
                    padding={60} 
                    magnetStrength={6}
                    activeTransition="transform 0.3s ease-out"
                    inactiveTransition="transform 0.5s ease-in-out"
                  >
                    <GlareHover
                      width="100%"
                      height="100%"
                      background="rgba(15, 15, 15, 0.95)"
                      borderRadius="16px"
                      borderColor="rgba(58, 255, 115, 0.2)"
                      glareColor="#3AFF73"
                      glareOpacity={0.12}
                      glareSize={180}
                      transitionDuration={500}
                      className="usecase-glare-card"
                    >
                      <div 
                        className={`usecase-card-enhanced ${expandedUseCase === i ? 'expanded' : ''}`}
                        onClick={() => handleUseCaseClick(i)}
                      >
                        <div className="usecase-header">
                          <div className="usecase-icon-container">
                            <div className="usecase-icon">
                              {useCase.icon}
                            </div>
                          </div>
                          <div className="usecase-title-container">
                            <h4 className="usecase-title">
                              <ShinyText text={useCase.title} speed={7} />
                            </h4>
                            <p className="usecase-summary">{useCase.summary}</p>
                          </div>
                          <div className="usecase-expand-icon">
                            {expandedUseCase === i ? '−' : '+'}
                          </div>
                        </div>
                        
                        {expandedUseCase === i && (
                          <div className="usecase-expanded-content">
                            <p className="usecase-description">
                              {useCase.description}
                            </p>
                          </div>
                        )}
                        
                        <div className="usecase-accent-line"></div>
                      </div>
                    </GlareHover>
                  </Magnet>
                </div>
              </FadeContent>
            ))}
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="final-cta-section" id="app">
          <FadeContent duration={1000} delay={200}>
            <a href="/demo" className="cta neon big">
              <GradientText colors={["#0a0a0a", "#1a1a1a"]} animationSpeed={4}>
                Start Building Secure AI Today
              </GradientText>
            </a>
          <div className="links">
            <a href="#github">GitHub</a> | <a href="https://visen0x.gitbook.io/visen0x/" target="_blank" rel="noopener noreferrer">CLI/Docs</a>
          </div>
          </FadeContent>
        </section>

        {/* Footer */}
        <footer className="visen-footer">
          <FadeContent duration={1000} delay={100}>
            <div className="footer-content">
              <div className="footer-brand">
                <div className="footer-logo">
                  <img 
                    src={newLogo} 
                    alt="Visen AI" 
                    className="footer-logo-image"
                  />
                </div>
                <p>
                  <ShinyText 
                    text="Securing the future of autonomous AI agents through decentralized infrastructure." 
                    speed={8} 
                  />
                </p>
              </div>
              
              <div className="footer-links">
                {footerLinks.map((section, i) => (
                  <FadeContent 
                    key={section.section} 
                    duration={800} 
                    delay={300 + i * 100}
                  >
                    <div className="footer-section">
                      <h5>{section.section}</h5>
                      <ul>
                        {section.links.map((link, j) => (
                          <li key={j}>
                            <a href={
                              link === "Twitter" ? "https://x.com/Visen_Ai" :
                              link === "GitHub" ? "https://github.com" :
                              link === "Documentation" ? "https://visen0x.gitbook.io/visen0x/" :
                              `#${link.toLowerCase().replace(/\s+/g, '-')}`
                            } 
                            {...(link === "Twitter" || link === "GitHub" || link === "Documentation" ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                            >
                              {link}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </FadeContent>
                ))}
              </div>
            </div>
            
            <div className="footer-bottom">
              <p>
                © 2025 Visen. All rights reserved.
              </p>
            </div>
          </FadeContent>
        </footer>
      </main>
    </div>
  );
};

export default App;
