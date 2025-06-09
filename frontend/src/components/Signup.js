"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate } from "react-router-dom";

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
    fullName: z.string().min(2, { message: "Full name is required" }),
    email: z.string().email({ message: "Invalid email address" }),
    universityId: z.string().min(5, { message: "University ID is required" }),
    password: z.string().min(8, { message: "Minimum 8 characters required" }),
});

function Signup() {
    const navigate = useNavigate();
    const [avatarFile, setAvatarFile] = useState(null);
    const [universityIDFile, setUniversityIDFile] = useState(null);

    const handleAvatarChange = (e) => {
        setAvatarFile(e.target.files[0]);
    };

    const handleUniversityIDChange = (e) => {
        setUniversityIDFile(e.target.files[0]);
    };

    const handleLoginClick = () => {
        navigate("/login");
    };

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            fullName: "",
            email: "",
            universityId: "",
            password: "",
        },
    });

    const onSubmit = async (values) => {
        if (!avatarFile || !universityIDFile) {
            console.log("Please upload both Avatar and University ID files");
            return;
        }

        const formData = new FormData();
        formData.append("name", values.fullName);
        formData.append("email", values.email);
        formData.append("uniId", values.universityId);
        formData.append("password", values.password);
        formData.append("avatar", avatarFile);
        formData.append("universityID", universityIDFile);

        try {
            const response = await fetch("http://localhost:4000/auth/createUser", {
                method: "POST",
                body: formData,
            });

            const json = await response.json();

            if (json.success) {
                localStorage.setItem("auth-token", json.token);
                navigate("/login");
            } else if (json.error?.includes("User already exists")) {
                console.log("User already exists");
            } else {
                console.log("Signup failed");
            }
        } catch (e) {
            console.error("Error occurred during signup:", e.message);
        }
    };

    return (
        <section className="h-auto flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Form Section */}
            <div className="w-full md:w-[60%] max-w-md md:ml-30 bg-[#0d0f17]/90 backdrop-blur-md rounded-2xl p-8 shadow-2xl text-white relative">
                <h1 className="text-2xl font-bold mt-8 text-center">📚 BookWise</h1>
                <h2 className="text-lg font-semibold mt-2 text-center">
                    Create Your Library Account
                </h2>
                <p className="text-sm text-gray-400 text-center mt-1 mb-6">
                    Please complete all fields and upload a valid university ID to gain access to the library.
                </p>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        {/* Full Name */}
                        <FormField
                            control={form.control}
                            name="fullName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Full Name</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Adrian Hajdin"
                                            className="bg-[#1e2230] border border-[#2c2f45] text-white placeholder:text-gray-500"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Email */}
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="email"
                                            placeholder="adrian@jsmastery.pro"
                                            className="bg-[#1e2230] border border-[#2c2f45] text-white placeholder:text-gray-500"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* University ID */}
                        <FormField
                            control={form.control}
                            name="universityId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>University ID Number</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="e.g., 394365762"
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

                        {/* Avatar upload */}
                        <div className="space-y-1">
                            <FormLabel>Upload Avatar</FormLabel>
                            <Input
                                type="file"
                                accept="image/*"
                                onChange={handleAvatarChange}
                                className="bg-[#1e2230] border border-[#2c2f45]"
                            />
                            {avatarFile && (
                                <p className="text-xs text-green-400 mt-1">Selected: {avatarFile.name}</p>
                            )}
                        </div>

                        {/* University ID upload */}
                        <div className="space-y-1">
                            <FormLabel>Upload University ID</FormLabel>
                            <Input
                                type="file"
                                accept="image/*,application/pdf"
                                onChange={handleUniversityIDChange}
                                className="bg-[#1e2230] border border-[#2c2f45]"
                            />
                            {universityIDFile && (
                                <p className="text-xs text-green-400 mt-1">Selected: {universityIDFile.name}</p>
                            )}
                        </div>

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            className="w-full bg-[#f5c784] text-black hover:bg-[#f1b65f] mt-2 font-semibold"
                        >
                            Sign Up
                        </Button>
                    </form>
                </Form>

                {/* Footer Link */}
                <div className="text-sm text-gray-400 text-center mt-4">
                    Already have an account?{" "}
                    <Button
                        variant="link"
                        className="text-white font-medium hover:underline px-1"
                        type="button"
                        onClick={handleLoginClick}
                    >
                        Login
                    </Button>
                </div>
            </div>

            {/* Image Section */}
            <div className="w-full md:w-[40%] h-[300px] md:h-[1023px]">
                <img
                    className="w-full h-full object-cover rounded-xl shadow"
                    src="/cover.png"
                    alt="Signup Cover"
                />
            </div>
        </section>
    );
}

export default Signup;
