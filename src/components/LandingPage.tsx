import { motion } from 'framer-motion';
import React from 'react';
import { Link } from 'react-router-dom';

export const LandingPage = () => {
  return (
    <div className="min-h-screen bg-[#0A0A0F] text-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <nav className="flex justify-between items-center mb-16">
          <div className="flex items-center space-x-2">
            <div className="bg-indigo-600 text-white p-2 rounded-lg">DM</div>
            <span className="text-white text-xl font-bold">DormMate</span>
          </div>
          <div className="flex items-center space-x-6">
            <Link to="/rooms" className="text-gray-400 hover:text-white transition">Rooms</Link>
            <Link to="/amenities" className="text-gray-400 hover:text-white transition">Amenities</Link>
            <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition">
              Book Now
            </button>
            <a href="/auth"><button className="border border-indigo-600 text-indigo-400 px-4 py-2 rounded-lg hover:bg-indigo-600 hover:text-white transition">
              Login
            </button></a>
          </div>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-indigo-400 font-medium mb-4 flex items-center">
              <span className="mr-2">⭐</span>
              Premium Student Living
            </div>
            <h1 className="text-5xl font-bold text-white mb-6">
              Your Perfect Room at{' '}
              <span className="text-indigo-400">University Heights</span>
            </h1>
            <p className="text-gray-400 text-lg mb-8">
              Experience luxury student living in the heart of Boston. Modern rooms, 
              state-of-the-art amenities, and a vibrant community await you.
            </p>
            <div className="flex space-x-4">
              <button className="bg-indigo-600 text-white px-8 py-3 rounded-lg hover:bg-indigo-700 transition">
                View Rooms
              </button>
              <button className="bg-[#1A1A1F] text-white px-8 py-3 rounded-lg hover:bg-[#2A2A2F] transition">
                Take a Tour
              </button>
            </div>
            <div className="grid grid-cols-3 gap-8 mt-12">
              <div className="flex items-center space-x-2">
                <div className="text-indigo-400">✓</div>
                <div className="text-gray-400">24/7 Security</div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="text-indigo-400">✓</div>
                <div className="text-gray-400">High-Speed WiFi</div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="text-indigo-400">✓</div>
                <div className="text-gray-400">Fitness Center</div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="bg-[#1A1A1F] p-6 rounded-xl shadow-xl">
              <div className="space-y-6">
                <div className="bg-[#252530] rounded-lg p-4">
                  <h3 className="text-xl font-semibold text-white mb-2">Deluxe Single Room</h3>
                  <div className="flex items-center space-x-2 text-gray-400">
                    <span>📍</span>
                    <span>4th Floor</span>
                  </div>
                  <div className="flex items-center space-x-2 mt-2">
                    <div className="flex text-yellow-400">
                      {'★'.repeat(5)}
                    </div>
                    <span className="text-white">5.0</span>
                    <span className="text-gray-400">(28 reviews)</span>
                  </div>
                  <div className="mt-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-sm text-gray-400">Monthly rent</div>
                        <div className="text-2xl font-bold text-white">$899<span className="text-sm text-gray-400">/month</span></div>
                      </div>
                      <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition">
                        Book Now
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-[#252530] rounded-lg p-4">
                  <h3 className="text-xl font-semibold text-white mb-2">Premium Double Room</h3>
                  <div className="flex items-center space-x-2 text-gray-400">
                    <span>📍</span>
                    <span>3rd Floor</span>
                  </div>
                  <div className="flex items-center space-x-2 mt-2">
                    <div className="flex text-yellow-400">
                      {'★'.repeat(5)}
                    </div>
                    <span className="text-white">4.9</span>
                    <span className="text-gray-400">(42 reviews)</span>
                  </div>
                  <div className="mt-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-sm text-gray-400">Monthly rent</div>
                        <div className="text-2xl font-bold text-white">$699<span className="text-sm text-gray-400">/month</span></div>
                      </div>
                      <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition">
                        Book Now
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
