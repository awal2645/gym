import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import PricingCard from '../components/PricingCard';
import StepForm from '../components/StepForm';
import Button from '../components/Button';
import { plansApi } from '../api/plans';

export default function Landing() {
    const [plans, setPlans] = useState([]);
    const [showQuiz, setShowQuiz] = useState(false);
    const [recommendedPlan, setRecommendedPlan] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        plansApi.getAll()
            .then((response) => setPlans(response.data))
            .catch((error) => console.error('Error fetching plans:', error));
    }, []);

    const handleQuizComplete = (planId) => {
        setRecommendedPlan(planId);
        setShowQuiz(false);
    };

    const handleGetStarted = () => {
        if (recommendedPlan) {
            navigate(`/checkout/${recommendedPlan}`);
        } else {
            navigate('/register');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            {/* Hero Section */}
            <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-5xl font-bold mb-6">
                        Transform Your Body, Transform Your Life
                    </h1>
                    <p className="text-xl mb-8 max-w-2xl mx-auto">
                        Get personalized training plans, expert guidance, and the support you need to achieve your fitness goals.
                    </p>
                    <div className="flex justify-center space-x-4">
                        <Link to="/register">
                            <Button variant="secondary" className="bg-white text-blue-600 hover:bg-gray-100">
                                Get Started
                            </Button>
                        </Link>
                        <Link to="/login">
                            <Button variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                                Login
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Benefits Section */}
            <section className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold text-center mb-12">Why Choose Our Training Program?</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="text-center">
                            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Personalized Plans</h3>
                            <p className="text-gray-600">Customized workout and nutrition plans tailored to your goals and fitness level.</p>
                        </div>
                        <div className="text-center">
                            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Expert Support</h3>
                            <p className="text-gray-600">Direct access to certified trainers for guidance and motivation.</p>
                        </div>
                        <div className="text-center">
                            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Track Progress</h3>
                            <p className="text-gray-600">Monitor your achievements and see real results with our tracking tools.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Form Checker Quiz */}
            <section className="py-20 bg-white" id="quiz">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold text-center mb-4">Find Your Perfect Plan</h2>
                    <p className="text-center text-gray-600 mb-8">Answer a few questions to get a personalized recommendation</p>
                    {!showQuiz && !recommendedPlan && (
                        <div className="text-center">
                            <Button onClick={() => setShowQuiz(true)}>Start Quiz</Button>
                        </div>
                    )}
                    {showQuiz && (
                        <StepForm onComplete={handleQuizComplete} />
                    )}
                    {recommendedPlan && (
                        <div className="text-center">
                            <p className="text-xl mb-4">Based on your answers, we recommend:</p>
                            <Button onClick={handleGetStarted}>View Recommended Plan</Button>
                        </div>
                    )}
                </div>
            </section>

            {/* Pricing Section */}
            <section className="py-20" id="pricing">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold text-center mb-12">Choose Your Plan</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                        {plans.map((plan) => (
                            <PricingCard key={plan.id} plan={plan} />
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold text-center mb-12">What Our Clients Say</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="bg-gray-50 p-6 rounded-lg">
                            <p className="text-gray-600 mb-4">"This program changed my life! I lost 30 pounds in 3 months and feel stronger than ever."</p>
                            <p className="font-semibold">- Sarah M.</p>
                        </div>
                        <div className="bg-gray-50 p-6 rounded-lg">
                            <p className="text-gray-600 mb-4">"The personalized approach and support from trainers made all the difference. Highly recommend!"</p>
                            <p className="font-semibold">- John D.</p>
                        </div>
                        <div className="bg-gray-50 p-6 rounded-lg">
                            <p className="text-gray-600 mb-4">"Best investment I've made in my health. The meal plans are amazing and workouts are challenging but doable."</p>
                            <p className="font-semibold">- Emily R.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section className="py-20" id="faq">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-lg shadow">
                            <h3 className="text-xl font-semibold mb-2">How do I get started?</h3>
                            <p className="text-gray-600">Simply register for an account, choose a plan, and complete your purchase. You'll get immediate access to your dashboard and training materials.</p>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow">
                            <h3 className="text-xl font-semibold mb-2">Can I change my plan later?</h3>
                            <p className="text-gray-600">Yes! You can upgrade or change your plan at any time. Contact support for assistance.</p>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow">
                            <h3 className="text-xl font-semibold mb-2">What if I need help?</h3>
                            <p className="text-gray-600">All plans include access to our chat support where you can message with our trainers directly.</p>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow">
                            <h3 className="text-xl font-semibold mb-2">Is there a money-back guarantee?</h3>
                            <p className="text-gray-600">We offer a 30-day money-back guarantee if you're not satisfied with your purchase.</p>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
