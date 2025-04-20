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
            className="relative space-y-6"
          >
            {/* Main Room Image */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="relative rounded-2xl overflow-hidden shadow-2xl"
            >
              <img
                src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80"
                alt="Modern Student Room"
                className="w-full h-[300px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0F] via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <div className="bg-[#1A1A1F]/90 p-4 rounded-lg backdrop-blur-sm">
                  <h3 className="text-lg font-semibold text-white">Deluxe Single Room</h3>
                  <p className="text-gray-400">Starting from Rs.10,000/month</p>
                </div>
              </div>
            </motion.div>

            {/* Feature Images Grid */}
            <div className="grid grid-cols-3 gap-4">
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="relative rounded-xl overflow-hidden"
              >
                <img
                  src="https://images.unsplash.com/photo-1574362848149-11496d93a7c7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
                  alt="Study Area"
                  className="w-full h-[120px] object-cover"
                />
                <div className="absolute inset-0 bg-indigo-600/20 hover:bg-indigo-600/30 transition" />
              </motion.div>
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="relative rounded-xl overflow-hidden"
              >
                <img
                  src="https://images.unsplash.com/photo-1571624436279-b272aff752b5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
                  alt="Community Space"
                  className="w-full h-[120px] object-cover"
                />
                <div className="absolute inset-0 bg-indigo-600/20 hover:bg-indigo-600/30 transition" />
              </motion.div>
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="relative rounded-xl overflow-hidden"
              >
                <img
                  src="https://images.unsplash.com/photo-1574362848149-11496d93a7c7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
                  alt="Fitness Center"
                  className="w-full h-[120px] object-cover"
                />
                <div className="absolute inset-0 bg-indigo-600/20 hover:bg-indigo-600/30 transition" />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
