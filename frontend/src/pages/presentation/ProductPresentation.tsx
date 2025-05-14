import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

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
    <div className="bg-gray-100 min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ 
            backgroundImage: "url('/images/extracted_images_bundle/page1_img1.jpeg')",
            filter: 'brightness(0.7)'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-800 opacity-50"></div>
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
            className="text-5xl md:text-7xl font-bold text-white mb-4 font-serif"
          >
            LATTÉ BOIS
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="text-xl md:text-2xl text-white font-light italic"
          >
            Élégance, Robustesse en un seul panneau
          </motion.p>
        </div>
      </section>

      {/* Navigation */}
      <div className="sticky top-0 bg-gray-800 text-white shadow-md z-20">
        <div className="container mx-auto px-4">
          <nav className="flex flex-wrap justify-center md:justify-start space-x-1 md:space-x-6 py-4 text-sm md:text-base">
            <Link 
              to="/"
              className="px-3 py-2 rounded-md transition-colors hover:bg-gray-700/60 flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Back to Home
            </Link>
            <button 
              onClick={() => setActiveSection('intro')}
              className={`px-3 py-2 rounded-md transition-colors ${activeSection === 'intro' ? 'bg-gray-700 font-semibold' : 'hover:bg-gray-700/60'}`}
            >
              Introduction
            </button>
            <button 
              onClick={() => setActiveSection('company')}
              className={`px-3 py-2 rounded-md transition-colors ${activeSection === 'company' ? 'bg-gray-700 font-semibold' : 'hover:bg-gray-700/60'}`}
            >
              SME FANTASIA
            </button>
            <button 
              onClick={() => setActiveSection('products')}
              className={`px-3 py-2 rounded-md transition-colors ${activeSection === 'products' ? 'bg-gray-700 font-semibold' : 'hover:bg-gray-700/60'}`}
            >
              Nos Panneaux
            </button>
            <button 
              onClick={() => setActiveSection('specs')}
              className={`px-3 py-2 rounded-md transition-colors ${activeSection === 'specs' ? 'bg-gray-700 font-semibold' : 'hover:bg-gray-700/60'}`}
            >
              Fiches Techniques
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        {/* Introduction Section */}
        {activeSection === 'intro' && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-4xl mx-auto"
          >
            <motion.div variants={itemVariants} className="mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-6 font-serif">Bienvenue chez LATTÉ BOIS</h2>
              <p className="text-lg text-gray-700 leading-relaxed">
                Découvrez notre gamme de panneaux lattés premium, où l'esthétique rencontre la durabilité.
                Nos produits combinent la beauté naturelle du bois avec une ingénierie de précision pour créer
                des solutions adaptées aux professionnels les plus exigeants.
              </p>
            </motion.div>
            
            <motion.div variants={itemVariants} className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="md:flex">
                <div className="md:w-1/2">
                  <img 
                    src="/images/extracted_images_bundle/page2_img1.jpeg" 
                    alt="Panneau latté de qualité" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="md:w-1/2 p-8">
                  <h3 className="text-2xl font-bold text-gray-700 mb-4">Qualité & Innovation</h3>
                  <p className="text-gray-700 mb-4">
                    Chaque panneau LATTÉ BOIS est le fruit d'un processus de fabrication rigoureux, 
                    combinant techniques traditionnelles et technologies modernes.
                  </p>
                  <div className="flex items-center mb-3">
                    <span className="text-gray-700 mr-2">✓</span>
                    <span>Robustesse exceptionnelle</span>
                  </div>
                  <div className="flex items-center mb-3">
                    <span className="text-gray-700 mr-2">✓</span>
                    <span>Finition impeccable</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-gray-700 mr-2">✓</span>
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
              <h2 className="text-4xl font-bold text-gray-900 mb-6 font-serif">Présentation de SME FANTASIA</h2>
              <div className="w-24 h-1 bg-gray-700 mx-auto mb-8"></div>
            </motion.div>
            
            <motion.div variants={itemVariants} className="mb-12">
              <div className="bg-white rounded-lg shadow-lg p-8">
                <p className="text-lg text-gray-700 leading-relaxed mb-6">
                  Fort de plus d'un demi-siècle d'expertise dans l'industrie du bois, SME FANTASIA conçoit et 
                  fournit une gamme de panneaux lattés de haute qualité. Ces panneaux sont parfaitement adaptés 
                  aux besoins des professionnels de :
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-gray-100 p-6 rounded-lg text-center">
                    <div className="text-gray-700 text-4xl mb-3">🏠</div>
                    <h3 className="font-bold text-gray-900 mb-2">L'agencement intérieur</h3>
                    <p className="text-gray-600">Solutions pour transformer les espaces intérieurs</p>
                  </div>
                  
                  <div className="bg-gray-100 p-6 rounded-lg text-center">
                    <div className="text-gray-700 text-4xl mb-3">🪚</div>
                    <h3 className="font-bold text-gray-900 mb-2">La menuiserie</h3>
                    <p className="text-gray-600">Matériaux premium pour artisans et fabricants</p>
                  </div>
                  
                  <div className="bg-gray-100 p-6 rounded-lg text-center">
                    <div className="text-gray-700 text-4xl mb-3">🪑</div>
                    <h3 className="font-bold text-gray-900 mb-2">La fabrication de mobilier</h3>
                    <p className="text-gray-600">Base idéale pour créer des meubles durables</p>
                  </div>
                </div>
                
                <p className="text-lg text-gray-700 leading-relaxed mb-6">
                  Nos produits sont le fruit d'un processus de fabrication industrielle maîtrisé, garantissant :
                </p>
                
                <div className="flex flex-wrap justify-center gap-4 mb-8">
                  <div className="bg-gray-800 text-white px-6 py-3 rounded-full">Robustesse</div>
                  <div className="bg-gray-800 text-white px-6 py-3 rounded-full">Esthétisme</div>
                  <div className="bg-gray-800 text-white px-6 py-3 rounded-full">Polyvalence</div>
                </div>
                
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="font-bold text-gray-900 mb-4">Composition du panneau latté :</h3>
                  <ul className="list-disc pl-6 text-gray-700 space-y-2">
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
              <h2 className="text-4xl font-bold text-gray-900 mb-6 font-serif">Nos Panneaux Lattés</h2>
              <div className="w-24 h-1 bg-gray-700 mx-auto mb-8"></div>
              <p className="text-lg text-gray-700 max-w-3xl mx-auto">
                Découvrez notre gamme de panneaux lattés, conçus pour répondre à tous vos besoins en matière d'agencement,
                de construction et de design d'intérieur.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Product 1 */}
              <motion.div variants={itemVariants} className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="h-64 overflow-hidden">
                  <img 
                    src="/images/extracted_images_bundle/page4_img1.jpeg" 
                    alt="Latté Peuplier + Formica" 
                    className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    🔹 Latté Peuplier + Formica
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Un panneau latté plaqué feuille de peuplier avec une finition en formica blanc.
                  </p>
                  <h4 className="font-semibold text-gray-700 mb-2">Avantages :</h4>
                  <ul className="space-y-1 mb-4">
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      <span>Légèreté</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      <span>Surface lisse</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      <span>Résistance</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      <span>Facilité d'entretien</span>
                    </li>
                  </ul>
                </div>
              </motion.div>

              {/* Product 2 */}
              <motion.div variants={itemVariants} className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="h-64 overflow-hidden">
                  <img 
                    src="/images/extracted_images_bundle/page5_img1.jpeg" 
                    alt="Latté MDF + Formica" 
                    className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    🔹 Latté MDF + Formica
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Un panneau latté en MDF avec un placage en formica blanc, offrant :
                  </p>
                  <ul className="space-y-1 mb-4">
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      <span>Haute densité</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      <span>Surface uniforme</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      <span>Durabilité exceptionnelle</span>
                    </li>
                  </ul>
                  <div className="mt-4 bg-blue-50 p-4 rounded-md">
                    <p className="text-blue-800 text-sm">
                      <span className="font-bold">💡 Recommandé pour</span> les projets d'agencement intérieur et de mobilier nécessitant une finition soignée.
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Product 3 */}
              <motion.div variants={itemVariants} className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="h-64 overflow-hidden">
                  <img 
                    src="/images/extracted_images_bundle/page6_img1.jpeg" 
                    alt="Latté MDF Hydrofuge + Mélaminé Blanc" 
                    className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    🔹 Latté MDF Hydrofuge + Mélaminé Blanc
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Conçu pour les environnements humides, ce panneau utilise du MDF hydrofuge et une finition mélaminée blanche.
                  </p>
                  <h4 className="font-semibold text-gray-700 mb-2">Idéal pour :</h4>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">Cuisines</span>
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">Salles de bain</span>
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">Zones exposées à l'eau</span>
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
              <h2 className="text-4xl font-bold text-gray-900 mb-6 font-serif">Fiches Techniques Complètes</h2>
              <div className="w-24 h-1 bg-gray-700 mx-auto mb-8"></div>
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
              <motion.div variants={itemVariants} className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-white font-bold mr-3">1</div>
                  <h3 className="text-xl font-bold text-gray-900">Panneau Latté Peuplier + Formica</h3>
                </div>
                <div className="pl-14">
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-700 mb-2">Plaquage Niveau 2 :</h4>
                    <p className="text-gray-600">2 plaques de formica blanc – 2440×1220×0,6 mm</p>
                  </div>
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-700 mb-2">Plaquage Niveau 1 :</h4>
                    <p className="text-gray-600">2 plaques de peuplier – 2440×1220×1,9 mm</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2">Âme en bois :</h4>
                    <p className="text-gray-600">Bois scié collé – 2440×1220×13 mm</p>
                  </div>
                </div>
              </motion.div>
              
              {/* Spec 2 */}
              <motion.div variants={itemVariants} className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-white font-bold mr-3">2</div>
                  <h3 className="text-xl font-bold text-gray-900">Panneau Latté MDF + Formica</h3>
                </div>
                <div className="pl-14">
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-700 mb-2">Plaquage Niveau 2 :</h4>
                    <p className="text-gray-600">2 plaques de formica blanc – 2440×1220×0,6 mm</p>
                  </div>
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-700 mb-2">Plaquage Niveau 1 :</h4>
                    <p className="text-gray-600">2 plaques de MDF – 2440×1220×2,4 mm</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2">Âme en bois :</h4>
                    <p className="text-gray-600">Bois scié collé – 2440×1220×12 mm</p>
                  </div>
                </div>
              </motion.div>
              
              {/* Spec 3 */}
              <motion.div variants={itemVariants} className="bg-white rounded-lg shadow-lg p-6 lg:col-span-2">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-white font-bold mr-3">3</div>
                  <h3 className="text-xl font-bold text-gray-900">Panneau Latté MDF Hydrofuge + Mélaminé Blanc</h3>
                </div>
                <div className="pl-14 md:flex md:gap-8">
                  <div className="mb-4 md:mb-0">
                    <h4 className="font-semibold text-gray-700 mb-2">Plaquage Niveau 2 :</h4>
                    <p className="text-gray-600">2 feuilles mélaminées blanches – 2440×1220 mm</p>
                  </div>
                  <div className="mb-4 md:mb-0">
                    <h4 className="font-semibold text-gray-700 mb-2">Plaquage Niveau 1 :</h4>
                    <p className="text-gray-600">2 plaques de MDF hydrofuge – 2440×1220×2,5 mm</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2">Âme en bois :</h4>
                    <p className="text-gray-600">Bois scié collé – 2440×1220×13 mm</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-center md:text-left mb-6 md:mb-0">
              <h3 className="text-2xl font-bold mb-2 font-serif">LATTÉ BOIS</h3>
              <p className="text-sm text-gray-300">Élégance, Robustesse en un seul panneau</p>
            </div>
            <div className="text-center md:text-right">
              <p className="text-sm text-gray-300">© 2023 SME FANTASIA. Tous droits réservés.</p>
              <p className="text-sm text-gray-300">Conçu avec passion pour les professionnels du bois</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ProductPresentation;