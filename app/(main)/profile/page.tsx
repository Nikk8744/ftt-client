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
import PageHeader from '@/components/layout/PageHeader';
import { ClipboardCheck, Clock, Folders, Pencil } from 'lucide-react';

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
      <PageHeader
        title="Your Profile"
        description="View and update your profile information"
        actionLabel={!isEditing ? "Edit Profile" : undefined}
        onActionClick={!isEditing ? handleEdit : undefined}
        actionIcon={<Pencil className="h-4 w-4" />}
        variant="default"
      />
      
      <div className="flex-1 bg-gray-50 dark:bg-gray-900">
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
                    className="w-24 h-24 border-4 border-white dark:border-gray-800 shadow-lg"
                  />
                  {!isEditing && (
                    <button
                      onClick={handleEdit}
                      className="absolute bottom-0 right-0 bg-white dark:bg-gray-700 rounded-full p-1.5 shadow-md hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                    >
                      <Pencil className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    </button>
                  )}
                </div>
                <div className="mb-3">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{user.name}</h2>
                  <p className="text-gray-500 dark:text-gray-400">@{user.userName}</p>
                </div>
              </div>
            </div>

            <div className="mt-16 grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2">
                <Card className="bg-white dark:bg-gray-800">
                  {!isEditing ? (
                    // Profile View
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Profile Information</h3>
                        <dl className="divide-y divide-gray-200 dark:divide-gray-700">
                          <div className="py-4 grid grid-cols-3 gap-4">
                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Full Name</dt>
                            <dd className="text-sm text-gray-900 dark:text-gray-100 col-span-2">{user.name}</dd>
                          </div>
                          <div className="py-4 grid grid-cols-3 gap-4">
                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Username</dt>
                            <dd className="text-sm text-gray-900 dark:text-gray-100 col-span-2">@{user.userName}</dd>
                          </div>
                          <div className="py-4 grid grid-cols-3 gap-4">
                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</dt>
                            <dd className="text-sm text-gray-900 dark:text-gray-100 col-span-2">{user.email}</dd>
                          </div>
                          <div className="py-4 grid grid-cols-3 gap-4">
                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Role</dt>
                            <dd className="text-sm text-gray-900 dark:text-gray-100 col-span-2">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 capitalize">
                                {user.role}
                              </span>
                            </dd>
                          </div>
                          <div className="py-4 grid grid-cols-3 gap-4">
                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Member Since</dt>
                            <dd className="text-sm text-gray-900 dark:text-gray-100 col-span-2">
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
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Edit Profile</h3>
                        <div className="space-y-4">
                          <div>
                            <Input
                              id="name"
                              label="Full Name"
                              {...register('name')}
                              error={errors.name?.message}
                              fullWidth
                              className="bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                            />
                          </div>

                          <div>
                            <Input
                              id="userName"
                              label="Username"
                              {...register('userName')}
                              error={errors.userName?.message}
                              fullWidth
                              className="bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
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
                              className="bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 flex justify-end space-x-3">
                        <Button
                          variant="outline"
                          onClick={handleCancel}
                          className="text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="brandBtn"
                          type="submit"
                          isLoading={updateUserMutation.isPending}
                          disabled={updateUserMutation.isPending}
                        >
                          Save Changes
                        </Button>
                      </div>

                      {updateUserMutation.isError && (
                        <div className="mt-2 text-sm text-red-600 dark:text-red-400">
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
                <Card className="bg-white dark:bg-gray-800">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Activity</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                      <div className="flex items-center gap-2">
                        <Folders className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Projects</span>
                      </div>
                      <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{projects ? projects.length : 0}</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                      <div className="flex items-center gap-2">
                        <ClipboardCheck className="w-5 h-5 text-green-500 dark:text-green-400" />
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Tasks</span>
                      </div>
                      <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{tasks ? tasks.length : 0}</span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-purple-500 dark:text-purple-400" />
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Time Tracked</span>
                      </div>
                      <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">124h</span>
                    </div>
                  </div>
                </Card>

                {/* Account Info */}
                <Card className="bg-white dark:bg-gray-800">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Account</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        Active
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Login</span>
                      <span className="text-sm text-gray-900 dark:text-gray-100">Today at 12:45 PM</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Two-Factor Auth</span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
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
