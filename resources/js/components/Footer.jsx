import React from 'react';

export default function Footer() {
    return (
        <footer className="bg-gray-800 text-white mt-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div>
                        <h3 className="text-xl font-bold mb-4">Gym Trainer</h3>
                        <p className="text-gray-400">
                            Your personal fitness journey starts here. Get expert guidance and achieve your goals.
                        </p>
                    </div>
                    <div>
                        <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
                        <ul className="space-y-2 text-gray-400">
                            <li><a href="/" className="hover:text-white">Home</a></li>
                            <li><a href="#pricing" className="hover:text-white">Pricing</a></li>
                            <li><a href="#faq" className="hover:text-white">FAQ</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-lg font-semibold mb-4">Contact</h4>
                        <p className="text-gray-400">
                            Email: support@gymtrainer.com
                        </p>
                    </div>
                </div>
                <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
                    <p>&copy; {new Date().getFullYear()} Gym Trainer. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}
