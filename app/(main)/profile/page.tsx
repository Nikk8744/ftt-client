'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { updateUser } from '@/services/user';
import useAuth from '@/lib/hooks/useAuth';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import PageWrapper from '@/components/layout/PageWrapper';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { UserUpdateData } from '@/types';

// Form validation schema
const profileSchema = z.object({
  name: z.string().min(1, 'Full name is required'),
  userName: z.string().min(1, 'Username is required'),
  email: z.string().email('Invalid email address'),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const { user, updateUserInfo } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  
  // Form setup
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      userName: user?.userName || '',
      email: user?.email || '',
    },
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: (data: UserUpdateData) => updateUser(Number(user?.id), data),
    onSuccess: (data) => {
      if (data.user) {
        updateUserInfo(data.user);
      }
      setIsEditing(false);
    },
  });

  const handleEdit = () => {
    setIsEditing(true);
    reset({
      name: user?.name || '',
      userName: user?.userName || '',
      email: user?.email || '',
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const onSubmit = (data: ProfileFormData) => {
    updateUserMutation.mutate(data);
  };

  if (!user) {
    return <div>Loading profile...</div>;
  }

  return (
    <PageWrapper 
      title="Your Profile" 
      description="View and update your profile information"
      actions={
        !isEditing ? (
          <Button variant="primary" onClick={handleEdit}>
            Edit Profile
          </Button>
        ) : null
      }
    >
      <div className="p-6">
        <div className="max-w-3xl mx-auto">
          <Card>
            {!isEditing ? (
              // Profile View
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="h-16 w-16 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center text-white text-2xl font-medium shadow-lg">
                    {user.name.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-xl font-medium text-gray-900">{user.name}</h2>
                    <p className="text-gray-500">{user.email}</p>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4 mt-4">
                  <dl className="divide-y divide-gray-200">
                    <div className="py-3 grid grid-cols-3 gap-4">
                      <dt className="text-sm font-medium text-gray-500">Full Name</dt>
                      <dd className="text-sm text-gray-900 col-span-2">{user.name}</dd>
                    </div>
                    <div className="py-3 grid grid-cols-3 gap-4">
                      <dt className="text-sm font-medium text-gray-500">Username</dt>
                      <dd className="text-sm text-gray-900 col-span-2">{user.userName}</dd>
                    </div>
                    <div className="py-3 grid grid-cols-3 gap-4">
                      <dt className="text-sm font-medium text-gray-500">Email</dt>
                      <dd className="text-sm text-gray-900 col-span-2">{user.email}</dd>
                    </div>
                    <div className="py-3 grid grid-cols-3 gap-4">
                      <dt className="text-sm font-medium text-gray-500">Role</dt>
                      <dd className="text-sm text-gray-900 col-span-2">
                        <span className="capitalize">{user.role}</span>
                      </dd>
                    </div>
                    <div className="py-3 grid grid-cols-3 gap-4">
                      <dt className="text-sm font-medium text-gray-500">Member Since</dt>
                      <dd className="text-sm text-gray-900 col-span-2">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            ) : (
              // Edit Profile Form
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Input
                  id="name"
                  label="Full Name"
                  {...register('name')}
                  error={errors.name?.message}
                  fullWidth
                />

                <Input
                  id="userName"
                  label="Username"
                  {...register('userName')}
                  error={errors.userName?.message}
                  fullWidth
                />

                <Input
                  id="email"
                  label="Email"
                  type="email"
                  {...register('email')}
                  error={errors.email?.message}
                  fullWidth
                />

                <div className="pt-4 flex justify-end space-x-3">
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    type="submit"
                    isLoading={updateUserMutation.isPending}
                    disabled={updateUserMutation.isPending}
                  >
                    Save Changes
                  </Button>
                </div>

                {updateUserMutation.isError && (
                  <div className="mt-2 text-sm text-red-600">
                    Error updating profile. Please try again.
                  </div>
                )}
              </form>
            )}
          </Card>
        </div>
      </div>
    </PageWrapper>
  );
} 