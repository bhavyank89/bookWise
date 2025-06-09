"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate } from 'react-router-dom';

import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

// Zod schema
const formSchema = z.object({
    email: z.string().email({ message: "Invalid email address" }),
    password: z.string().min(8, { message: "Minimum 8 characters required" }),
});

function Login({ setIsLogin }) {
    const navigate = useNavigate();

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const handleRegisterClick = () => {
        console.log("Register here clicked");
        navigate('/signup');
    };

    const onSubmit = async (values) => {
        console.log("Submitted:", values);
        try {
            const url = 'http://localhost:4000/auth/login';
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "content-type": "application/json",
                },
                body: JSON.stringify(values)
            });

            const json = await response.json();

            if (json.success) {
                localStorage.setItem('auth-token', json.token);
                console.log("Login successful!");
                console.log("Token:", json.token);
                setIsLogin(true);
                navigate("/dashboard");
            }
            else if (json.error && json.error.includes("Invalid credentials")) {
                console.log("Invalid credentials");
            }
            else {
                console.log("Login failed!");
            }

        } catch (e) {
            console.log("Error occurred: ", e.message);
        }
    };

    return (
        <section className="h-auto flex flex-col md:flex-row items-center justify-between gap-6">

            {/* Form Section */}
            <div className="w-full md:w-[60%] max-w-md md:ml-30 bg-[#0d0f17]/90 backdrop-blur-md rounded-2xl p-8 shadow-2xl text-white relative">

                {/* Heading */}
                <h1 className="text-2xl font-bold mt-8 text-center">📚 BookWise</h1>
                <h2 className="text-lg font-semibold mt-2 text-center">
                    Welcome Back to BookWise
                </h2>
                <p className="text-sm text-gray-400 text-center mt-1 mb-6">
                    Access the vast collection of resources and stay updated
                </p>

                {/* Form */}
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        {/* Email */}
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="adrian@jsmastery.pro"
                                            type="email"
                                            className="bg-[#1e2230] border border-[#2c2f45] text-white placeholder:text-gray-500"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Password */}
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Password</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="password"
                                            placeholder="At least 8 characters long"
                                            className="bg-[#1e2230] border border-[#2c2f45] text-white placeholder:text-gray-500"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            className="w-full bg-[#f5c784] text-black hover:bg-[#f1b65f] mt-2 font-semibold"
                        >
                            Login
                        </Button>

                        {/* Footer Link */}
                        <p className="text-sm text-gray-400 text-center mt-4">
                            Don't have an account yet?{" "}
                            <Button
                                type="button"
                                variant="link"
                                onClick={handleRegisterClick}
                                className="text-white font-medium hover:underline px-1"
                            >
                                Register here
                            </Button>
                        </p>
                    </form>
                </Form>
            </div>

            {/* Image Section */}
            <div className="w-full md:w-[40%] h-[300px] md:h-[1023px]">
                <img
                    className="w-full h-full object-cover rounded-xl shadow"
                    src="/cover.png"
                    alt="Login Cover"
                />
            </div>
        </section>
    );
}

export default Login;
