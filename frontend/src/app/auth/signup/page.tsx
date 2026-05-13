'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignUpPage() {
    const router = useRouter();
    const [form, setForm] = useState({ email: '', username: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const res = await fetch('/api/auth/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(form),
        });

        if (!res.ok) {
            const data = await res.json();
            setError(data.error ?? 'Sign up failed');
            setLoading(false);
            return;
        }

        await signIn('credentials', {
            email: form.email,
            password: form.password,
            redirect: false,
        });

        router.push('/');
        router.refresh();
    };

    const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
        setForm(f => ({ ...f, [field]: e.target.value }));

    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="w-full max-w-md">
                <div className="bg-primary border border-border rounded-xl p-8">
                    <h1 className="text-3xl font-tungsten text-accent uppercase tracking-widest mb-2">VCT Tracker</h1>
                    <p className="text-muted text-sm mb-8">Create an account to start predicting</p>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm text-muted mb-1.5">Username</label>
                            <input
                                type="text"
                                value={form.username}
                                onChange={set('username')}
                                required
                                minLength={3}
                                className="w-full bg-secondary text-white text-sm rounded-lg py-2.5 px-4 outline-none border border-border focus:border-accent/50 transition-all placeholder:text-muted"
                                placeholder="RadiantPicker"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-muted mb-1.5">Email</label>
                            <input
                                type="email"
                                value={form.email}
                                onChange={set('email')}
                                required
                                className="w-full bg-secondary text-white text-sm rounded-lg py-2.5 px-4 outline-none border border-border focus:border-accent/50 transition-all placeholder:text-muted"
                                placeholder="you@example.com"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-muted mb-1.5">Password</label>
                            <input
                                type="password"
                                value={form.password}
                                onChange={set('password')}
                                required
                                minLength={8}
                                className="w-full bg-secondary text-white text-sm rounded-lg py-2.5 px-4 outline-none border border-border focus:border-accent/50 transition-all placeholder:text-muted"
                                placeholder="At least 8 characters"
                            />
                        </div>

                        {error && (
                            <p className="text-sm text-red-400">{error}</p>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-2.5 bg-accent text-white font-bold rounded-lg hover:bg-accent/80 transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Creating account…' : 'Create Account'}
                        </button>
                    </form>

                    <p className="text-center text-muted text-sm mt-6">
                        Already have an account?{' '}
                        <Link href="/auth/signin" className="text-accent hover:underline">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
