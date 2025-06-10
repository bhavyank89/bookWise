import React from 'react';
import { X, User, UserCog } from 'lucide-react';

function RoleModal({ closeModal, setSelectedRole, selectedRole, handleContinue, isModalOpen, setIsModalOpen }) {
    return (
        <>
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={closeModal}
                    ></div>

                    {/* Modal Content */}
                    <div className="relative bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8 max-w-md w-full shadow-2xl">
                        {/* Close button */}
                        <button
                            onClick={closeModal}
                            className="absolute cursor-pointer top-4 right-4 text-white/70 hover:text-white transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        {/* Modal Header */}
                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-bold text-white mb-2">Choose Your Role</h2>
                            <p className="text-white/70">Select how you'd like to use Bookwise</p>
                        </div>

                        {/* Role Selection */}
                        <div className="grid grid-cols-2 gap-6 mb-8">
                            {/* User Avatar */}
                            <div
                                className={`cursor-pointer group transition-all duration-300 ${selectedRole === 'user'
                                    ? 'scale-105'
                                    : 'hover:scale-105'
                                    }`}
                                onClick={() => setSelectedRole('user')}
                            >
                                <div className={`relative p-1 rounded-full transition-all duration-300 ${selectedRole === 'user'
                                    ? 'bg-gradient-to-r from-green-400 to-green-600 shadow-lg shadow-green-400/30'
                                    : 'bg-white/20 group-hover:bg-white/30'
                                    }`}>
                                    <div className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-full p-6 w-20 h-20 flex items-center justify-center mx-auto">
                                        <User className="w-8 h-8 text-white" />
                                    </div>
                                </div>
                                <div className="text-center mt-3">
                                    <h3 className="text-white font-semibold">User</h3>
                                    <p className="text-white/60 text-sm">Browse & read books</p>
                                </div>
                            </div>

                            {/* Admin Avatar */}
                            <div
                                className={`cursor-pointer group transition-all duration-300 ${selectedRole === 'admin'
                                    ? 'scale-105'
                                    : 'hover:scale-105'
                                    }`}
                                onClick={() => setSelectedRole('admin')}
                            >
                                <div className={`relative p-1 rounded-full transition-all duration-300 ${selectedRole === 'admin'
                                    ? 'bg-gradient-to-r from-green-400 to-green-600 shadow-lg shadow-green-400/30'
                                    : 'bg-white/20 group-hover:bg-white/30'
                                    }`}>
                                    <div className="bg-gradient-to-br from-purple-400 to-purple-600 rounded-full p-6 w-20 h-20 flex items-center justify-center mx-auto">
                                        <UserCog className="w-8 h-8 text-white" />
                                    </div>
                                </div>
                                <div className="text-center mt-3">
                                    <h3 className="text-white font-semibold">Admin</h3>
                                    <p className="text-white/60 text-sm">Manage library system</p>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-4">
                            <button
                                onClick={closeModal}
                                className="flex-1 cursor-pointer bg-white/10 hover:bg-white/20 border border-white/20 text-white px-6 py-3 rounded-full font-semibold transition-all duration-300"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleContinue}
                                disabled={!selectedRole}
                                className={`flex-1 px-6 py-3 rounded-full font-semibold transition-all cursor-pointer duration-300 ${selectedRole
                                    ? 'bg-[#F79B72] hover:bg-orange-500 text-black shadow-lg shadow-orange-400/30'
                                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                                    }`}
                            >
                                Continue
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default RoleModal
