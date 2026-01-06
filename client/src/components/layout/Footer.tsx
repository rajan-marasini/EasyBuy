import {
    Facebook,
    Instagram,
    ShoppingBag,
    Twitter,
    Youtube,
} from "lucide-react";
import Link from "next/link";

export default function Footer() {
    return (
        <footer className="bg-linear-to-br from-zinc-900 via-zinc-900 to-zinc-950 text-zinc-200 border-t border-zinc-800">
            <div className="container mx-auto py-16 px-4">
                {/* Brand Section */}
                <div className="mb-12 text-center">
                    <ShoppingBag className="w-8 h-8 text-emerald-500 group-hover:scale-110 transition-transform" />
                    <span className="text-3xl font-black bg-linear-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
                        EasyBuy
                    </span>
                </div>
                <p className="text-zinc-400 max-w-md mx-auto">
                    Your one-stop destination for premium electronics and
                    gadgets. Shop with confidence and enjoy exclusive deals.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12 px-6">
                {/* Shop Categories */}
                <div>
                    <h3 className="text-lg font-bold text-white mb-4 bg-linear-to-r from-emerald-400 to-teal-400 bg-clip-text">
                        Shop Categories
                    </h3>
                    <ul className="space-y-3">
                        <li>
                            <Link
                                href="/category/phones"
                                className="text-zinc-400 hover:text-emerald-400 transition-colors inline-flex items-center gap-2 group"
                            >
                                <span className="w-1 h-1 rounded-full bg-zinc-600 group-hover:bg-emerald-400 transition-colors"></span>
                                Phones
                            </Link>
                        </li>
                        <li>
                            <Link
                                href="/category/laptops"
                                className="text-zinc-400 hover:text-emerald-400 transition-colors inline-flex items-center gap-2 group"
                            >
                                <span className="w-1 h-1 rounded-full bg-zinc-600 group-hover:bg-emerald-400 transition-colors"></span>
                                Laptops
                            </Link>
                        </li>
                        <li>
                            <Link
                                href="/category/watches"
                                className="text-zinc-400 hover:text-emerald-400 transition-colors inline-flex items-center gap-2 group"
                            >
                                <span className="w-1 h-1 rounded-full bg-zinc-600 group-hover:bg-emerald-400 transition-colors"></span>
                                Watches
                            </Link>
                        </li>
                        <li>
                            <Link
                                href="/category/accessories"
                                className="text-zinc-400 hover:text-emerald-400 transition-colors inline-flex items-center gap-2 group"
                            >
                                <span className="w-1 h-1 rounded-full bg-zinc-600 group-hover:bg-emerald-400 transition-colors"></span>
                                Accessories
                            </Link>
                        </li>
                    </ul>
                </div>

                {/* Customer Support */}
                <div>
                    <h3 className="text-lg font-bold text-white mb-4 bg-linear-to-r from-teal-400 to-cyan-400 bg-clip-text">
                        Customer Support
                    </h3>
                    <ul className="space-y-3">
                        <li>
                            <Link
                                href="/contact"
                                className="text-zinc-400 hover:text-emerald-400 transition-colors inline-flex items-center gap-2 group"
                            >
                                <span className="w-1 h-1 rounded-full bg-zinc-600 group-hover:bg-emerald-400 transition-colors"></span>
                                Contact Us
                            </Link>
                        </li>
                        <li>
                            <Link
                                href="/shipping"
                                className="text-zinc-400 hover:text-emerald-400 transition-colors inline-flex items-center gap-2 group"
                            >
                                <span className="w-1 h-1 rounded-full bg-zinc-600 group-hover:bg-emerald-400 transition-colors"></span>
                                Shipping Info
                            </Link>
                        </li>
                        <li>
                            <Link
                                href="/returns"
                                className="text-zinc-400 hover:text-emerald-400 transition-colors inline-flex items-center gap-2 group"
                            >
                                <span className="w-1 h-1 rounded-full bg-zinc-600 group-hover:bg-emerald-400 transition-colors"></span>
                                Returns & Refunds
                            </Link>
                        </li>
                        <li>
                            <Link
                                href="/faq"
                                className="text-zinc-400 hover:text-emerald-400 transition-colors inline-flex items-center gap-2 group"
                            >
                                <span className="w-1 h-1 rounded-full bg-zinc-600 group-hover:bg-emerald-400 transition-colors"></span>
                                FAQs
                            </Link>
                        </li>
                    </ul>
                </div>

                {/* Company */}
                <div>
                    <h3 className="text-lg font-bold text-white mb-4 bg-linear-to-r from-emerald-400 to-green-400 bg-clip-text">
                        About Us
                    </h3>
                    <ul className="space-y-3">
                        <li>
                            <Link
                                href="/about"
                                className="text-zinc-400 hover:text-emerald-400 transition-colors inline-flex items-center gap-2 group"
                            >
                                <span className="w-1 h-1 rounded-full bg-zinc-600 group-hover:bg-emerald-400 transition-colors"></span>
                                Our Story
                            </Link>
                        </li>
                        <li>
                            <Link
                                href="/careers"
                                className="text-zinc-400 hover:text-emerald-400 transition-colors inline-flex items-center gap-2 group"
                            >
                                <span className="w-1 h-1 rounded-full bg-zinc-600 group-hover:bg-emerald-400 transition-colors"></span>
                                Careers
                            </Link>
                        </li>
                        <li>
                            <Link
                                href="/privacy"
                                className="text-zinc-400 hover:text-emerald-400 transition-colors inline-flex items-center gap-2 group"
                            >
                                <span className="w-1 h-1 rounded-full bg-zinc-600 group-hover:bg-emerald-400 transition-colors"></span>
                                Privacy Policy
                            </Link>
                        </li>
                        <li>
                            <Link
                                href="/terms"
                                className="text-zinc-400 hover:text-emerald-400 transition-colors inline-flex items-center gap-2 group"
                            >
                                <span className="w-1 h-1 rounded-full bg-zinc-600 group-hover:bg-emerald-400 transition-colors"></span>
                                Terms of Service
                            </Link>
                        </li>
                    </ul>
                </div>

                {/* Follow Us */}
                <div>
                    <h3 className="text-lg font-bold text-white mb-4 bg-linear-to-r from-green-400 to-emerald-400 bg-clip-text">
                        Follow Us
                    </h3>
                    <div className="flex gap-3">
                        <Link
                            href="#"
                            className="p-3 bg-zinc-800 rounded-xl hover:bg-linear-to-br hover:from-emerald-600 hover:to-emerald-700 transition-all hover:scale-110 shadow-lg hover:shadow-emerald-500/50"
                        >
                            <Facebook className="h-5 w-5" />
                        </Link>
                        <Link
                            href="#"
                            className="p-3 bg-zinc-800 rounded-xl hover:bg-linear-to-br hover:from-teal-500 hover:to-teal-600 transition-all hover:scale-110 shadow-lg hover:shadow-teal-500/50"
                        >
                            <Twitter className="h-5 w-5" />
                        </Link>
                        <Link
                            href="#"
                            className="p-3 bg-zinc-800 rounded-xl hover:bg-linear-to-br hover:from-green-600 hover:to-green-700 transition-all hover:scale-110 shadow-lg hover:shadow-green-500/50"
                        >
                            <Instagram className="h-5 w-5" />
                        </Link>
                        <Link
                            href="#"
                            className="p-3 bg-zinc-800 rounded-xl hover:bg-linear-to-br hover:from-cyan-600 hover:to-cyan-700 transition-all hover:scale-110 shadow-lg hover:shadow-cyan-500/50"
                        >
                            <Youtube className="h-5 w-5" />
                        </Link>
                    </div>
                </div>
            </div>

            <div className="border-t border-zinc-800 py-8 text-center">
                <p className="text-zinc-500 text-sm">
                    © {new Date().getFullYear()}{" "}
                    <span className="font-bold bg-linear-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                        EasyBuy
                    </span>
                    . All rights reserved.
                </p>
            </div>
        </footer>
    );
}
