'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { updateUser } from '@/services/user';
import useAuth from '@/lib/hooks/useAuth';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { UserUpdateData } from '@/types';
import Avatar from '@/components/ui/Avatar';
import { getAllProjectsOfUser } from '@/services/project';
import { getUserTasks } from '@/services/task';

// Form validation schema
const profileSchema = z.object({
  name: z.string().min(1, 'Full name is required'),
  userName: z.string().min(1, 'Username is required'),
  email: z.string().email('Invalid email address'),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const { user, updateUserInfo } = useAuth();
  const queryClient = useQueryClient();
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

  const { data: projectsData } = useQuery({
    queryKey: ['projects'],
    queryFn: getAllProjectsOfUser,
  });

  const { data: tasksData } = useQuery({
    queryKey: ['tasks'],
    queryFn: getUserTasks,
  });

  const projects = projectsData?.projects || [];
  const tasks = tasksData?.tasks || [];

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: (data: UserUpdateData) => updateUser(Number(user?.id), data),
    onSuccess: async (data) => {
      if (data.user) {
        updateUserInfo(data.user);
        await queryClient.invalidateQueries({ queryKey: ['currentUser'] });
        await queryClient.refetchQueries({ queryKey: ['currentUser'] });
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
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-center">
          <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-48 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-32"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      <div className="border-b border-gray-400 rounded-b-3xl">
        <div className="px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="mb-4 md:mb-0">
            <h1 className="text-2xl font-bold text-gray-900 leading-tight">
              Your Profile
            </h1>
            <p className="mt-1 text-sm text-gray-500 max-w-4xl">
              View and update your profile information
            </p>
          </div>
          {!isEditing && (
            <div className="flex flex-shrink-0 space-x-2">
              <Button variant="default" onClick={handleEdit}>
                Edit Profile
              </Button>
            </div>
          )}
        </div>
      </div>
      <div className="flex-1 bg-gray-50">
        <div className="p-6">
          <div className="max-w-4xl mx-auto">
            {/* Profile Header */}
            <div className="relative mb-8">
              <div className="h-48 w-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg"></div>
              <div className="absolute -bottom-12 left-8 flex items-end space-x-5">
                <div className="relative">
                  <Avatar 
                    name={user.name} 
                    size="lg" 
                    className="w-24 h-24 border-4 border-white shadow-lg"
                  />
                  {!isEditing && (
                    <button
                      onClick={handleEdit}
                      className="absolute bottom-0 right-0 bg-white rounded-full p-1.5 shadow-md hover:bg-gray-50 transition-colors"
                    >
                      <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                  )}
                </div>
                <div className="mb-3">
                  <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
                  <p className="text-gray-500">@{user.userName}</p>
                </div>
              </div>
            </div>

            <div className="mt-16 grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2">
                <Card>
                  {!isEditing ? (
                    // Profile View
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Information</h3>
                        <dl className="divide-y divide-gray-200">
                          <div className="py-4 grid grid-cols-3 gap-4">
                            <dt className="text-sm font-medium text-gray-500">Full Name</dt>
                            <dd className="text-sm text-gray-900 col-span-2">{user.name}</dd>
                          </div>
                          <div className="py-4 grid grid-cols-3 gap-4">
                            <dt className="text-sm font-medium text-gray-500">Username</dt>
                            <dd className="text-sm text-gray-900 col-span-2">@{user.userName}</dd>
                          </div>
                          <div className="py-4 grid grid-cols-3 gap-4">
                            <dt className="text-sm font-medium text-gray-500">Email</dt>
                            <dd className="text-sm text-gray-900 col-span-2">{user.email}</dd>
                          </div>
                          <div className="py-4 grid grid-cols-3 gap-4">
                            <dt className="text-sm font-medium text-gray-500">Role</dt>
                            <dd className="text-sm text-gray-900 col-span-2">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                                {user.role}
                              </span>
                            </dd>
                          </div>
                          <div className="py-4 grid grid-cols-3 gap-4">
                            <dt className="text-sm font-medium text-gray-500">Member Since</dt>
                            <dd className="text-sm text-gray-900 col-span-2">
                              {new Date(user.created_at).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </dd>
                          </div>
                        </dl>
                      </div>
                    </div>
                  ) : (
                    // Edit Profile Form
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit Profile</h3>
                        <div className="space-y-4">
                          <div>
                            <Input
                              id="name"
                              label="Full Name"
                              {...register('name')}
                              error={errors.name?.message}
                              fullWidth
                            />
                          </div>

                          <div>
                            <Input
                              id="userName"
                              label="Username"
                              {...register('userName')}
                              error={errors.userName?.message}
                              fullWidth
                              // startAdornment=""
                            />
                          </div>

                          <div>
                            <Input
                              id="email"
                              label="Email"
                              type="email"
                              {...register('email')}
                              error={errors.email?.message}
                              fullWidth
                            />
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 flex justify-end space-x-3">
                        <Button
                          variant="outline"
                          onClick={handleCancel}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="default"
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

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Quick Stats */}
                <Card>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                        <span className="text-sm font-medium text-gray-500">Projects</span>
                      </div>
                      <span className="text-sm font-semibold text-gray-900">{projects ? projects.length : 0}</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                        </svg>
                        <span className="text-sm font-medium text-gray-500">Tasks</span>
                      </div>
                      <span className="text-sm font-semibold text-gray-900">{tasks ? tasks.length : 0}</span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-sm font-medium text-gray-500">Time Tracked</span>
                      </div>
                      <span className="text-sm font-semibold text-gray-900">124h</span>
                    </div>
                  </div>
                </Card>

                {/* Account Info */}
                <Card>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Account</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-500">Status</span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Active
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-500">Last Login</span>
                      <span className="text-sm text-gray-900">Today at 12:45 PM</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-500">Two-Factor Auth</span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        Not Enabled
                      </span>
                    </div>
                  </div>
                </Card> 
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 