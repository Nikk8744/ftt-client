import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { User } from "@/types";
import { Eye, EyeOff } from "lucide-react";
import React from "react";

interface TaskFollowersProps {
  followers: User[];
  followersLoading: boolean;
  isUserFollowing: boolean;
  handleFollowToggle: () => void;
  currentUserId: number | undefined;
}

export const TaskFollowers = ({
  followers,
  followersLoading,
  isUserFollowing,
  handleFollowToggle,
}: TaskFollowersProps) => {
  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <Eye className="w-5 h-5 text-yellow-600" />
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-0 dark:text-gray-100">
            Followers
          </h3>
          {followers.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {followers.length}
            </Badge>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleFollowToggle}
          className="text-xs"
        >
          {isUserFollowing ? (
            <>
              <EyeOff className="h-4 w-4 md:mr-1" />
              <span className="hidden md:inline">Unfollow</span>
            </>
          ) : (
            <>
              <Eye className="h-4 w-4 md:mr-1" />
              <span className="hidden md:inline">Follow</span>
            </>
          )}
        </Button>
      </div>
      {followersLoading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="flex items-center gap-3 animate-pulse"
            >
              <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-3 bg-gray-200 rounded mb-1"></div>
                <div className="h-2 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      ) : followers.length > 0 ? (
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {followers.map((follower: User) => (
            <div
              key={follower.id}
              className="flex items-center gap-2 sm:gap-3 p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Avatar name={follower.name} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">
                  {follower.name}
                </p>
                <p className="text-xs text-gray-500 truncate hidden sm:block">
                  {follower.email}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-6">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Eye className="w-6 h-6 text-gray-400" />
          </div>
          <p className="text-sm font-medium text-gray-500 mb-1">
            No followers
          </p>
          <p className="text-xs text-gray-400">
            No one is following this task yet
          </p>
        </div>
      )}
    </Card>
  );
};
