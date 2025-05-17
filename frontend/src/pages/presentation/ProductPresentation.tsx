import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import '../../styles/wood-client-theme.css';

const ProductPresentation: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>('intro');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.2
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  return (
    <div className="min-h-screen bg-wood-neutral-50">
      {/* Hero Section */}
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ 
            backgroundImage: "url('/images/extracted_images_bundle/page1_img1.jpeg')",
            filter: 'brightness(0.7)'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-wood-brown-900 opacity-50"></div>
        <div className="container mx-auto px-4 z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
            transition={{ duration: 0.8 }}
            className="inline-block mb-4"
          >
            <img src="/images/extracted_images_bundle/page1_img2.jpeg" alt="Lattée Bois Logo" className="h-24 mx-auto" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-5xl md:text-7xl font-bold text-white mb-4 font-['Playfair_Display',_serif]"
          >
            LATTÉ BOIS
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="text-xl md:text-2xl  text-white  font-light italic"
          >
            Élégance, Robustesse en un seul panneau
          </motion.p>
        </div>
      </section>

      {/* Navigation */}
      <div className="sticky top-0 z-20 bg-wood-brown-900 shadow-md">
        <div className="container mx-auto px-4">
          <nav className="flex flex-wrap justify-center md:justify-start space-x-1 md:space-x-6 py-4 text-sm md:text-base">
            <Link 
              to="/"
              className="text-wood-brown-100 px-3 py-2 rounded-md transition-colors hover:bg-wood-brown-800 flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Back to Home
            </Link>
            <button 
              onClick={() => setActiveSection('intro')}
              className={`text-wood-brown-100 px-3 py-2 rounded-md transition-colors ${activeSection === 'intro' ? 'bg-wood-brown-800 font-semibold' : 'hover:bg-wood-brown-800'}`}
            >
              Introduction
            </button>
            <button 
              onClick={() => setActiveSection('company')}
              className={`text-wood-brown-100 px-3 py-2 rounded-md transition-colors ${activeSection === 'company' ? 'bg-wood-brown-800 font-semibold' : 'hover:bg-wood-brown-800'}`}
            >
              SME FANTASIA
            </button>
            <button 
              onClick={() => setActiveSection('products')}
              className={`text-wood-brown-100 px-3 py-2 rounded-md transition-colors ${activeSection === 'products' ? 'bg-wood-brown-800 font-semibold' : 'hover:bg-wood-brown-800'}`}
            >
              Nos Panneaux
            </button>
            <button 
              onClick={() => setActiveSection('specs')}
              className={`text-wood-brown-100 px-3 py-2 rounded-md transition-colors ${activeSection === 'specs' ? 'bg-wood-brown-800 font-semibold' : 'hover:bg-wood-brown-800'}`}
            >
              Fiches Techniques
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="wood-client-container py-12">
        {/* Introduction Section */}
        {activeSection === 'intro' && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-4xl mx-auto"
          >
            <motion.div variants={itemVariants} className="mb-12">
              <h2 className="wood-page-title text-4xl font-bold mb-6">Bienvenue chez LATTÉ BOIS</h2>
              <p className="text-lg text-wood-brown-800 leading-relaxed">
                Découvrez notre gamme de panneaux lattés premium, où l'esthétique rencontre la durabilité.
                Nos produits combinent la beauté naturelle du bois avec une ingénierie de précision pour créer
                des solutions adaptées aux professionnels les plus exigeants.
              </p>
            </motion.div>
            
            <motion.div variants={itemVariants} className="wood-card overflow-hidden">
              <div className="md:flex">
                <div className="md:w-1/2">
                  <img 
                    src="/images/extracted_images_bundle/page2_img1.jpeg" 
                    alt="Panneau latté de qualité" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="md:w-1/2 p-8">
                  <h3 className="wood-card-title mb-4">Qualité & Innovation</h3>
                  <p className="text-wood-brown-700 mb-4">
                    Chaque panneau LATTÉ BOIS est le fruit d'un processus de fabrication rigoureux, 
                    combinant techniques traditionnelles et technologies modernes.
                  </p>
                  <div className="flex items-center mb-3">
                    <span className="text-wood-brown-600 mr-2">✓</span>
                    <span>Robustesse exceptionnelle</span>
                  </div>
                  <div className="flex items-center mb-3">
                    <span className="text-wood-brown-600 mr-2">✓</span>
                    <span>Finition impeccable</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-wood-brown-600 mr-2">✓</span>
                    <span>Respect de l'environnement</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Company Section */}
        {activeSection === 'company' && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-4xl mx-auto"
          >
            <motion.div variants={itemVariants} className="mb-12 text-center">
              <h2 className="wood-section-title inline-block text-4xl font-bold">Présentation de SME FANTASIA</h2>
            </motion.div>
            
            <motion.div variants={itemVariants} className="mb-12">
              <div className="wood-card p-8">
                <p className="text-lg text-wood-brown-700 leading-relaxed mb-6">
                  Fort de plus d'un demi-siècle d'expertise dans l'industrie du bois, SME FANTASIA conçoit et 
                  fournit une gamme de panneaux lattés de haute qualité. Ces panneaux sont parfaitement adaptés 
                  aux besoins des professionnels de :
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="wood-service-card flex-col items-center text-center">
                    <div className="text-wood-brown-700 text-4xl mb-3">🏠</div>
                    <h3 className="font-bold text-wood-brown-800 mb-2">L'agencement intérieur</h3>
                    <p className="text-wood-brown-600">Solutions pour transformer les espaces intérieurs</p>
                  </div>
                  
                  <div className="wood-service-card flex-col items-center text-center">
                    <div className="text-wood-brown-700 text-4xl mb-3">🪚</div>
                    <h3 className="font-bold text-wood-brown-800 mb-2">La menuiserie</h3>
                    <p className="text-wood-brown-600">Matériaux premium pour artisans et fabricants</p>
                  </div>
                  
                  <div className="wood-service-card flex-col items-center text-center">
                    <div className="text-wood-brown-700 text-4xl mb-3">🪑</div>
                    <h3 className="font-bold text-wood-brown-800 mb-2">La fabrication de mobilier</h3>
                    <p className="text-wood-brown-600">Base idéale pour créer des meubles durables</p>
                  </div>
                </div>
                
                <p className="text-lg text-wood-brown-700 leading-relaxed mb-6">
                  Nos produits sont le fruit d'un processus de fabrication industrielle maîtrisé, garantissant :
                </p>
                
                <div className="flex flex-wrap justify-center gap-4 mb-8">
                  <div className="bg-wood-brown-700 text-white px-6 py-3 rounded-full">Robustesse</div>
                  <div className="bg-wood-brown-700 text-white px-6 py-3 rounded-full">Esthétisme</div>
                  <div className="bg-wood-brown-700 text-white px-6 py-3 rounded-full">Polyvalence</div>
                </div>
                
                <div className="border-t border-wood-brown-300 pt-6">
                  <h3 className="font-bold text-wood-brown-800 mb-4">Composition du panneau latté :</h3>
                  <ul className="list-disc pl-6 text-wood-brown-700 space-y-2">
                    <li>Une âme en bois massif, soigneusement assemblée et collée</li>
                    <li>Des placages sur ses deux faces</li>
                  </ul>
                </div>
              </div>
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <div className="rounded-lg overflow-hidden">
                <img 
                  src="/images/extracted_images_bundle/page3_img1.jpeg" 
                  alt="Atelier de production SME FANTASIA" 
                  className="w-full h-auto"
                />
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Products Section */}
        {activeSection === 'products' && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-5xl mx-auto"
          >
            <motion.div variants={itemVariants} className="mb-12 text-center">
              <h2 className="wood-section-title inline-block text-4xl font-bold">Nos Panneaux Lattés</h2>
              <p className="text-lg text-wood-brown-700 max-w-3xl mx-auto mt-8">
                Découvrez notre gamme de panneaux lattés, conçus pour répondre à tous vos besoins en matière d'agencement,
                de construction et de design d'intérieur.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Product 1 */}
              <motion.div variants={itemVariants} className="wood-product-card">
                <div className="wood-product-image-container">
                  <img 
                    src="/images/extracted_images_bundle/page4_img1.jpeg" 
                    alt="Latté Peuplier + Formica" 
                    className="wood-product-image"
                  />
                </div>
                <div className="wood-product-content">
                  <h3 className="wood-product-title">
                    🔹 Latté Peuplier + Formica
                  </h3>
                  <p className="wood-product-description">
                    Un panneau latté plaqué feuille de peuplier avec une finition en formica blanc.
                  </p>
                  <h4 className="font-semibold text-wood-brown-700 mb-2">Avantages :</h4>
                  <ul className="space-y-1 mb-4">
                    <li className="flex items-start">
                      <span className="text-wood-green-600 mr-2">✓</span>
                      <span>Légèreté</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-wood-green-600 mr-2">✓</span>
                      <span>Surface lisse</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-wood-green-600 mr-2">✓</span>
                      <span>Résistance</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-wood-green-600 mr-2">✓</span>
                      <span>Facilité d'entretien</span>
                    </li>
                  </ul>
                </div>
              </motion.div>

              {/* Product 2 */}
              <motion.div variants={itemVariants} className="wood-product-card">
                <div className="wood-product-image-container">
                  <img 
                    src="/images/extracted_images_bundle/page5_img1.jpeg" 
                    alt="Latté MDF + Formica" 
                    className="wood-product-image"
                  />
                </div>
                <div className="wood-product-content">
                  <h3 className="wood-product-title">
                    🔹 Latté MDF + Formica
                  </h3>
                  <p className="wood-product-description">
                    Un panneau latté en MDF avec un placage en formica blanc, offrant :
                  </p>
                  <ul className="space-y-1 mb-4">
                    <li className="flex items-start">
                      <span className="text-wood-green-600 mr-2">✓</span>
                      <span>Haute densité</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-wood-green-600 mr-2">✓</span>
                      <span>Surface uniforme</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-wood-green-600 mr-2">✓</span>
                      <span>Durabilité exceptionnelle</span>
                    </li>
                  </ul>
                  <div className="mt-4 bg-wood-brown-100 p-4 rounded-md">
                    <p className="text-wood-brown-800 text-sm">
                      <span className="font-bold">💡 Recommandé pour</span> les projets d'agencement intérieur et de mobilier nécessitant une finition soignée.
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Product 3 */}
              <motion.div variants={itemVariants} className="wood-product-card">
                <div className="wood-product-image-container">
                  <img 
                    src="/images/extracted_images_bundle/page6_img1.jpeg" 
                    alt="Latté MDF Hydrofuge + Mélaminé Blanc" 
                    className="wood-product-image"
                  />
                </div>
                <div className="wood-product-content">
                  <h3 className="wood-product-title">
                    🔹 Latté MDF Hydrofuge + Mélaminé Blanc
                  </h3>
                  <p className="wood-product-description">
                    Conçu pour les environnements humides, ce panneau utilise du MDF hydrofuge et une finition mélaminée blanche.
                  </p>
                  <h4 className="font-semibold text-wood-brown-700 mb-2">Idéal pour :</h4>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="wood-badge-info px-3 py-1 rounded-full text-sm">Cuisines</span>
                    <span className="wood-badge-info px-3 py-1 rounded-full text-sm">Salles de bain</span>
                    <span className="wood-badge-info px-3 py-1 rounded-full text-sm">Zones exposées à l'eau</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* Specs Section */}
        {activeSection === 'specs' && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-5xl mx-auto"
          >
            <motion.div variants={itemVariants} className="mb-12 text-center">
              <h2 className="wood-section-title inline-block text-4xl font-bold">Fiches Techniques Complètes</h2>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              <motion.div variants={itemVariants} className="lg:col-span-2">
                <img 
                  src="/images/extracted_images_bundle/page7_img1.jpeg" 
                  alt="Diagram technique de panneau latté" 
                  className="w-full h-auto rounded-lg shadow-lg mb-8"
                />
              </motion.div>
              
              {/* Spec 1 */}
              <motion.div variants={itemVariants} className="wood-card p-6">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 rounded-full bg-wood-brown-700 flex items-center justify-center text-white font-bold mr-3">1</div>
                  <h3 className="text-xl font-bold text-wood-brown-800">Panneau Latté Peuplier + Formica</h3>
                </div>
                <div className="pl-14">
                  <div className="mb-4">
                    <h4 className="font-semibold text-wood-brown-700 mb-2">Plaquage Niveau 2 :</h4>
                    <p className="text-wood-brown-600">2 plaques de formica blanc – 2440×1220×0,6 mm</p>
                  </div>
                  <div className="mb-4">
                    <h4 className="font-semibold text-wood-brown-700 mb-2">Plaquage Niveau 1 :</h4>
                    <p className="text-wood-brown-600">2 plaques de peuplier – 2440×1220×1,9 mm</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-wood-brown-700 mb-2">Âme en bois :</h4>
                    <p className="text-wood-brown-600">Bois scié collé – 2440×1220×13 mm</p>
                  </div>
                </div>
              </motion.div>
              
              {/* Spec 2 */}
              <motion.div variants={itemVariants} className="wood-card p-6">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 rounded-full bg-wood-brown-700 flex items-center justify-center text-white font-bold mr-3">2</div>
                  <h3 className="text-xl font-bold text-wood-brown-800">Panneau Latté MDF + Formica</h3>
                </div>
                <div className="pl-14">
                  <div className="mb-4">
                    <h4 className="font-semibold text-wood-brown-700 mb-2">Plaquage Niveau 2 :</h4>
                    <p className="text-wood-brown-600">2 plaques de formica blanc – 2440×1220×0,6 mm</p>
                  </div>
                  <div className="mb-4">
                    <h4 className="font-semibold text-wood-brown-700 mb-2">Plaquage Niveau 1 :</h4>
                    <p className="text-wood-brown-600">2 plaques de MDF – 2440×1220×2,4 mm</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-wood-brown-700 mb-2">Âme en bois :</h4>
                    <p className="text-wood-brown-600">Bois scié collé – 2440×1220×12 mm</p>
                  </div>
                </div>
              </motion.div>
              
              {/* Spec 3 */}
              <motion.div variants={itemVariants} className="wood-card p-6 lg:col-span-2">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 rounded-full bg-wood-brown-700 flex items-center justify-center text-white font-bold mr-3">3</div>
                  <h3 className="text-xl font-bold text-wood-brown-800">Panneau Latté MDF Hydrofuge + Mélaminé Blanc</h3>
                </div>
                <div className="pl-14 md:flex md:gap-8">
                  <div className="mb-4 md:mb-0">
                    <h4 className="font-semibold text-wood-brown-700 mb-2">Plaquage Niveau 2 :</h4>
                    <p className="text-wood-brown-600">2 feuilles mélaminées blanches – 2440×1220 mm</p>
                  </div>
                  <div className="mb-4 md:mb-0">
                    <h4 className="font-semibold text-wood-brown-700 mb-2">Plaquage Niveau 1 :</h4>
                    <p className="text-wood-brown-600">2 plaques de MDF hydrofuge – 2440×1220×2,5 mm</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-wood-brown-700 mb-2">Âme en bois :</h4>
                    <p className="text-wood-brown-600">Bois scié collé – 2440×1220×13 mm</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Footer */}
      <footer>
        <div className="wood-footer max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="wood-footer-heading text-2xl font-bold font-['Playfair_Display',_serif]">LATTÉ BOIS</h3>
              <p className="wood-footer-text">Élégance, Robustesse en un seul panneau</p>
              <div className="wood-footer-logo flex items-center mt-4">
                <div className="wood-logo-icon w-8 h-8 flex items-center justify-center mr-2">
                  <span className="font-bold text-sm">SF</span>
                </div>
                <span className="font-semibold text-wood-brown-100">SME FANTASIA</span>
              </div>
            </div>
            
            <div>
              <h3 className="wood-footer-heading text-lg font-semibold">Contactez-nous</h3>
              <ul className="space-y-2">
                <li className="wood-footer-contact">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  +1 210-298-9663
                </li>
                <li className="wood-footer-contact">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  info@smefantasia.com
                </li>
                <li className="wood-footer-contact">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  123 Wood Lane, Forest Hills, CA
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="wood-footer-heading text-lg font-semibold">Liens Rapides</h3>
              <ul className="space-y-1">
                <li>
                  <Link to="/" className="wood-footer-link">
                    Accueil
                  </Link>
                </li>
                <li>
                  <Link to="/products" className="wood-footer-link">
                    Nos Produits
                  </Link>
                </li>
                <li>
                  <Link to="/about" className="wood-footer-link">
                    À Propos
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="wood-footer-link">
                    Contact
                  </Link>
                </li>
              </ul>
              
              <div className="mt-6">
                <div className="flex flex-wrap gap-2">
                  <a
                    href="https://facebook.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="wood-social-link"
                  >
                    Facebook
                  </a>
                  <a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="wood-social-link"
                  >
                    Instagram
                  </a>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-8 pt-4 border-t wood-footer-border text-center">
            <p className="wood-copyright">© 2023 SME FANTASIA. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ProductPresentation;