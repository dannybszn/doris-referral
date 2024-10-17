"use client"

import { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import Alert from '@/components/Alert';
import { useAuth } from '@/lib/AuthContext';

type UserRole = 'model' | 'agency';

const MAX_IMAGE_SIZE = 800; // Maximum width or height in pixels
const MAX_FILE_SIZE = 15 * 1024 * 1024; // 1MB

const resizeImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (file.size > MAX_FILE_SIZE) {
      reject(new Error('File size exceeds 15MB limit'));
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const elem = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_IMAGE_SIZE) {
            height *= MAX_IMAGE_SIZE / width;
            width = MAX_IMAGE_SIZE;
          }
        } else {
          if (height > MAX_IMAGE_SIZE) {
            width *= MAX_IMAGE_SIZE / height;
            height = MAX_IMAGE_SIZE;
          }
        }

        elem.width = width;
        elem.height = height;
        const ctx = elem.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(elem.toDataURL('image/jpeg', 0.6)); // Reduced quality to 0.6
      };
      img.onerror = reject;
    };
    reader.onerror = reject;
  });
};

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
  const { login } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleRoleSelect = (selectedRole: UserRole) => {
    setRole(selectedRole);
    setShowForm(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        setAlert({ message: "File size exceeds 1MB limit. Please choose a smaller image.", type: "error" });
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        setAvatar(file);
        setAlert(null);
      }
    }
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

    let avatarBase64 = '';
    if (role === 'model' && avatar) {
      try {
        avatarBase64 = await resizeImage(avatar);
      } catch (error) {
        console.error('Error resizing image:', error);
        setAlert({ message: "Error processing image. Please try again with a smaller image (max 1MB).", type: "error" });
        setIsLoading(false);
        return;
      }
    }

    const userData = {
      firstName: role === 'model' ? firstName : undefined,
      lastName: role === 'model' ? lastName : undefined,
      companyName: role === 'agency' ? companyName : undefined,
      email,
      phoneNumber,
      password,
      role,
      avatar: avatarBase64,
      signupCode: role === 'agency' ? signupCode : undefined
    };

    try {
      console.log('Sending registration data...');
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (response.ok) {
        console.log('Registration successful');
        login(data.token, data.role);
        setAlert({ message: "Registration successful", type: "success" });
        router.push('/account/discover');
      } else {
        console.error('Registration failed:', data.message);
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
                <Label htmlFor="avatar">Profile Picture (max 1MB)</Label>
                <Input
                  id="avatar"
                  type="file"
                  onChange={handleFileChange}
                  accept="image/*"
                  required
                  ref={fileInputRef}
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