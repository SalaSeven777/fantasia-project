import React from 'react';

const AboutUs: React.FC = () => {
  const manufacturingSteps = [
    {
      title: 'Material Selection',
      description: 'Careful selection of high-quality wood and materials from sustainable sources.',
      image: '/images/manufacturing/step1.jpg',
    },
    {
      title: 'Preparation',
      description: 'Precise cutting and preparation of materials according to specifications.',
      image: '/images/manufacturing/step2.jpg',
    },
    {
      title: 'Assembly',
      description: 'Expert assembly using advanced techniques and equipment.',
      image: '/images/manufacturing/step3.jpg',
    },
    {
      title: 'Finishing',
      description: 'Professional finishing and quality control checks.',
      image: '/images/manufacturing/step4.jpg',
    },
  ];

  const sustainabilityPractices = [
    {
      title: 'Sustainable Sourcing',
      description: 'We work with certified suppliers who follow responsible forestry practices.',
    },
    {
      title: 'Waste Reduction',
      description: 'Implementation of efficient processes to minimize waste and maximize material usage.',
    },
    {
      title: 'Energy Efficiency',
      description: 'Use of energy-efficient equipment and renewable energy sources where possible.',
    },
    {
      title: 'Recycling Program',
      description: 'Comprehensive recycling program for materials and packaging.',
    },
  ];

  return (
    <div className="bg-white">
      {/* Company History Section */}
      <div className="relative py-16 bg-white overflow-hidden">
        <div className="relative px-4 sm:px-6 lg:px-8">
          <div className="text-lg max-w-prose mx-auto">
            <h1>
              <span className="block text-base text-center text-indigo-600 font-semibold tracking-wide uppercase">
                Our Story
              </span>
              <span className="mt-2 block text-3xl text-center leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                SME FANTASIA
              </span>
            </h1>
            <p className="mt-8 text-xl text-gray-500 leading-8">
              Since our establishment, SME FANTASIA has been at the forefront of wood product manufacturing,
              combining traditional craftsmanship with modern technology to deliver exceptional quality
              and innovative solutions to our clients.
            </p>
          </div>
          <div className="mt-6 prose prose-indigo prose-lg text-gray-500 mx-auto">
            <p>
              Our journey began with a simple vision: to create superior wood products that meet the
              highest standards of quality while maintaining sustainable practices. Over the years,
              we have grown from a small workshop to a leading manufacturer in the industry.
            </p>
            <p>
              Today, we continue to build on our heritage of excellence, investing in the latest
              technology and maintaining our commitment to quality craftsmanship.
            </p>
          </div>
        </div>
      </div>

      {/* Mission & Vision Section */}
      <div className="bg-gray-50 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">Mission & Vision</h2>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-2">
            <div className="bg-white shadow rounded-lg p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Our Mission</h3>
              <p className="text-gray-500">
                To provide superior quality wood products and innovative solutions that exceed our
                customers' expectations while maintaining sustainable practices and contributing to
                the development of our community.
              </p>
            </div>
            <div className="bg-white shadow rounded-lg p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Our Vision</h3>
              <p className="text-gray-500">
                To be the leading manufacturer of premium wood products, recognized globally for our
                quality, innovation, and commitment to sustainability.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Manufacturing Process Section */}
      <div className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-12">
            Our Manufacturing Process
          </h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {manufacturingSteps.map((step, index) => (
              <div key={index} className="relative">
                <div className="aspect-w-3 aspect-h-2 mb-4">
                  <img
                    className="object-cover shadow-lg rounded-lg"
                    src={step.image}
                    alt={step.title}
                  />
                </div>
                <h3 className="text-lg font-medium text-gray-900">{step.title}</h3>
                <p className="mt-2 text-base text-gray-500">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sustainability Practices Section */}
      <div className="bg-gray-50 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">
              Our Commitment to Sustainability
            </h2>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
              We believe in responsible manufacturing that protects our environment for future generations.
            </p>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {sustainabilityPractices.map((practice, index) => (
              <div key={index} className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">{practice.title}</h3>
                <p className="text-base text-gray-500">{practice.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-indigo-700">
        <div className="max-w-2xl mx-auto text-center py-16 px-4 sm:py-20 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            <span className="block">Want to learn more?</span>
            <span className="block">Get in touch with our team.</span>
          </h2>
          <p className="mt-4 text-lg leading-6 text-indigo-200">
            We're here to answer your questions and discuss how we can help with your project.
          </p>
          <a
            href="/contact"
            className="mt-8 w-full inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-indigo-50 sm:w-auto"
          >
            Contact Us
          </a>
        </div>
      </div>
    </div>
  );
};

export default AboutUs; 