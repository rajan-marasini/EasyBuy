import { Facebook, Instagram, Twitter, Youtube } from "lucide-react";
import Link from "next/link";

export default function Footer() {
    return (
        <footer className="bg-slate-900 text-slate-200">
            <div className="container mx-auto py-12 px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Shop Categories */}
                    <div>
                        <h3 className="text-lg font-bold text-white mb-4">
                            Shop Categories
                        </h3>
                        <ul className="space-y-2">
                            <li>
                                <Link
                                    href="/category/phones"
                                    className="hover:text-blue-400 transition-colors"
                                >
                                    Phones
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/category/laptops"
                                    className="hover:text-blue-400 transition-colors"
                                >
                                    Laptops
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/category/watches"
                                    className="hover:text-blue-400 transition-colors"
                                >
                                    Watches
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/category/accessories"
                                    className="hover:text-blue-400 transition-colors"
                                >
                                    Accessories
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Customer Support */}
                    <div>
                        <h3 className="text-lg font-bold text-white mb-4">
                            Customer Support
                        </h3>
                        <ul className="space-y-2">
                            <li>
                                <Link
                                    href="/contact"
                                    className="hover:text-blue-400 transition-colors"
                                >
                                    Contact Us
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/shipping"
                                    className="hover:text-blue-400 transition-colors"
                                >
                                    Shipping Info
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/returns"
                                    className="hover:text-blue-400 transition-colors"
                                >
                                    Returns & Refunds
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/faq"
                                    className="hover:text-blue-400 transition-colors"
                                >
                                    FAQs
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Company */}
                    <div>
                        <h3 className="text-lg font-bold text-white mb-4">
                            About Us
                        </h3>
                        <ul className="space-y-2">
                            <li>
                                <Link
                                    href="/about"
                                    className="hover:text-blue-400 transition-colors"
                                >
                                    Our Story
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/careers"
                                    className="hover:text-blue-400 transition-colors"
                                >
                                    Careers
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/privacy"
                                    className="hover:text-blue-400 transition-colors"
                                >
                                    Privacy Policy
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/terms"
                                    className="hover:text-blue-400 transition-colors"
                                >
                                    Terms of Service
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Follow Us */}
                    <div>
                        <h3 className="text-lg font-bold text-white mb-4">
                            Follow Us
                        </h3>
                        <div className="flex gap-4">
                            <Link
                                href="#"
                                className="p-2 bg-slate-800 rounded-full hover:bg-blue-600 transition-colors"
                            >
                                <Facebook className="h-5 w-5" />
                            </Link>
                            <Link
                                href="#"
                                className="p-2 bg-slate-800 rounded-full hover:bg-blue-400 transition-colors"
                            >
                                <Twitter className="h-5 w-5" />
                            </Link>
                            <Link
                                href="#"
                                className="p-2 bg-slate-800 rounded-full hover:bg-pink-600 transition-colors"
                            >
                                <Instagram className="h-5 w-5" />
                            </Link>
                            <Link
                                href="#"
                                className="p-2 bg-slate-800 rounded-full hover:bg-red-600 transition-colors"
                            >
                                <Youtube className="h-5 w-5" />
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="border-t border-slate-800 mt-12 pt-8 text-center text-slate-500 text-sm">
                    <p>
                        © {new Date().getFullYear()} E-shop. All rights
                        reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}
