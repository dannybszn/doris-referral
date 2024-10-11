"use client"

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import Alert from '@/components/Alert';

type UserRole = 'model' | 'agency';

export default function RegisterForm() {
  const [showForm, setShowForm] = useState(false);
  const [role, setRole] = useState<UserRole>('model');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [avatar, setAvatar] = useState<File | null>(null);
  const [signupCode, setSignupCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const router = useRouter();

  const handleRoleSelect = (selectedRole: UserRole) => {
    setRole(selectedRole);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setAlert(null);

    if (password !== confirmPassword) {
      setAlert({ message: "Passwords do not match", type: "error" });
      setIsLoading(false);
      return;
    }

    const formData = new FormData();
    if (role === 'model') {
      formData.append('firstName', firstName);
      formData.append('lastName', lastName);
      if (avatar) {
        formData.append('avatar', avatar);
      }
    } else {
      formData.append('companyName', companyName);
      formData.append('signupCode', signupCode);
    }
    formData.append('email', email);
    formData.append('phoneNumber', phoneNumber);
    formData.append('password', password);
    formData.append('role', role);

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        setAlert({ message: "Registration successful", type: "success" });
        router.push('/account/discover');
      } else {
        setAlert({ message: data.message || "Registration failed", type: "error" });
      }
    } catch (error) {
      console.error('Registration error:', error);
      setAlert({ message: "An unexpected error occurred", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4 max-w-md mx-auto">
      <Dialog open={!showForm} onOpenChange={(open) => !open && setShowForm(true)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Choose Registration Type</DialogTitle>
            <DialogDescription>
              Select how you&apos;d like to register:
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center space-x-4 mt-4">
            <Button onClick={() => handleRoleSelect('model')}>Model</Button>
            <Button onClick={() => handleRoleSelect('agency')}>Agency</Button>
          </div>
        </DialogContent>
      </Dialog>

      {showForm && (
        <form onSubmit={handleSubmit} className="space-y-4">
          {alert && (
            <Alert
              message={alert.message}
              type={alert.type}
              onClose={() => setAlert(null)}
            />
          )}
          {role === 'model' ? (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="avatar">Profile Picture</Label>
                <Input
                  id="avatar"
                  type="file"
                  onChange={(e) => setAvatar(e.target.files?.[0] || null)}
                  accept="image/*"
                  required
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="signupCode">Sign-up Code</Label>
                <Input
                  id="signupCode"
                  value={signupCode}
                  onChange={(e) => setSignupCode(e.target.value)}
                  required
                />
              </div>
            </>
          )}
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="phoneNumber">Phone Number</Label>
            <Input
              id="phoneNumber"
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Registering...' : 'Register'}
          </Button>
          <div className="text-center">
            <Link href="/account/login" className="text-sm text-primary hover:underline">
              Already have an account? Sign in
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}