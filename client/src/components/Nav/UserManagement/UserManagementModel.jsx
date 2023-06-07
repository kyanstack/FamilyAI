import cn from 'classnames';
import { SearchIcon } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Button } from '~/components/ui/Button';
import { Dialog, DialogButton } from '~/components/ui/Dialog';
import DialogTemplate from '~/components/ui/DialogTemplate';
import Dropdown from '~/components/ui/Dropdown';
import { Input } from '~/components/ui/Input';
import { Label } from '~/components/ui/Label';
import {
  useCreateInviteMutation,
  useDeleteInviteMutation,
  useGetUserListQuery,
  useUpdateUserRoleMutation
} from '~/data-provider';
import { useAuthContext } from '~/hooks/AuthContext';

export default function UserManagementModel({ open, onOpenChange }) {
  const [searchMemberQuery, setSearchMemberQuery] = useState('');
  const { data, isLoading, refetch } = useGetUserListQuery(searchMemberQuery);
  const updateRoleMutation = useUpdateUserRoleMutation();
  const createInviteMutation = useCreateInviteMutation();
  const deleteInviteMutation = useDeleteInviteMutation();
  const { user: authUser } = useAuthContext();

  const [inviteEmails, setInviteEmails] = useState([]);
  const [inviteRole, setInviteRole] = useState('PARENT');
  const inviteInputRef = useRef(null);

  const handleSearchMember = (e) => {
    setSearchMemberQuery(e.target.value);
    refetch();
  };

  const updateRole = (id, role) => {
    updateRoleMutation.mutate({ id, role });
  };

  useEffect(() => {
    refetch();
  }, [updateRoleMutation.isSuccess, refetch, deleteInviteMutation.isSuccess, createInviteMutation.isSuccess]);

  const adminDropdownOptions = ['ADMIN', 'PARENT', 'CHILD'];
  const parentDropdownOptions = ['PARENT', 'CHILD'];

  const handleInviteEmails = (e) => {
    const emails = e.target.value.split(',');
    // validate if email is valid
    emails.forEach((email, index) => {
      email = email.trim();
      if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        emails.splice(index, 1);
      }
    });
    setInviteEmails(emails);
  };

  const handleInviteSend = () => {
    if (inviteEmails.length > 0) {
      createInviteMutation.mutate({ emails: inviteEmails, role: inviteRole });
    }
  };

  useEffect(() => {
    if (createInviteMutation.isSuccess) {
      inviteInputRef.current.value = '';
      setInviteEmails([]);
      setInviteRole('PARENT');
      alert('Invitation sent successfully');
    }
  }, [createInviteMutation.isSuccess]);

  useEffect(() => {
    if (deleteInviteMutation.isSuccess) {
      alert('Invitation deleted successfully');
    }
  }, [deleteInviteMutation.isSuccess]);

  const defaultTextProps =
    'rounded-md border border-gray-200 focus:border-slate-400 focus:bg-gray-50 bg-transparent text-sm shadow-[0_0_10px_rgba(0,0,0,0.05)] outline-none placeholder:text-gray-400 focus:outline-none focus:ring-gray-400 focus:ring-opacity-20 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-500 dark:bg-gray-700 focus:dark:bg-gray-600 dark:text-gray-50 dark:shadow-[0_0_15px_rgba(0,0,0,0.10)] dark:focus:border-gray-400 dark:focus:outline-none dark:focus:ring-0 dark:focus:ring-gray-400 dark:focus:ring-offset-0';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTemplate
        title="User Management"
        className="top-1/2 max-w-full -translate-y-1/2 sm:max-w-lg"
        main={
          <div className="flex w-full flex-col items-center gap-6 divide-y dark:divide-gray-600">
            <div className="relative w-full">
              <Label htmlFor="search" className="text-left text-sm font-medium">
                <SearchIcon className="absolute bottom-3 left-3 h-5 w-5 text-gray-300" />
              </Label>
              <Input
                id="search"
                placeholder="Search members"
                value={searchMemberQuery}
                onChange={handleSearchMember}
                className={cn(
                  defaultTextProps,
                  'flex h-10 max-h-10 w-full resize-none py-5 pl-10 pr-5 focus:outline-none focus:ring-0 focus:ring-opacity-0 focus:ring-offset-0'
                )}
              />
            </div>
            <div className="flex max-h-80 min-h-[14rem] w-full flex-col gap-5 self-stretch overflow-y-auto px-1 py-5 dark:text-gray-300">
              {!isLoading &&
                data?.map((user) => {
                  if (user?.isInvite) {
                    return (
                      <div key={user?._id} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <img
                            src={`https://avatars.dicebear.com/api/initials/-.svg`}
                            alt="avatar"
                            width={40}
                            height={40}
                            className="mr-3 inline-block h-10 w-10 rounded object-cover"
                          />
                          <div className="flex flex-col">
                            <strong>Pending invitation</strong>
                            <span className="text-gray-500">{user?.email}</span>
                          </div>
                        </div>
                        <Button variant="destructive" size="sm" onClick={() => deleteInviteMutation.mutate(user?._id)}>
                          Cancel
                        </Button>
                      </div>
                    );
                  }
                  return (
                    <div key={user?.id} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <img
                          src={`https://avatars.dicebear.com/api/initials/${user?.name}.svg`}
                          alt={user?.name}
                          width={40}
                          height={40}
                          className="mr-3 inline-block h-10 w-10 rounded object-cover"
                        />
                        <div className="flex flex-col">
                          <strong>
                            {user?.name}{' '}
                            {user?.email === authUser?.email && (
                              <span className="ml-2 rounded bg-gray-100 px-1 text-xs font-semibold uppercase tracking-wide text-gray-900">
                                YOU
                              </span>
                            )}
                          </strong>
                          <span className="text-gray-500">{user?.email}</span>
                        </div>
                      </div>
                      <Dropdown
                        value={user?.role}
                        onChange={(value) => updateRole(user?.id, value)}
                        options={
                          authUser?.role === 'ADMIN' ? adminDropdownOptions : parentDropdownOptions
                        }
                        className={cn({
                          'cursor-pointer': user?.id !== authUser?.id,
                          'cursor-not-allowed': user?.id === authUser?.id
                        })}
                      />
                    </div>
                  );
                })}
            </div>
            <div className="w-full py-5">
              <Label htmlFor="email" className="mb-2 inline-block text-left text-sm font-medium">
                Invite new members
              </Label>
              <div className="relative">
                <Input
                  ref={inviteInputRef}
                  id="email"
                  placeholder="Enter email"
                  onChange={handleInviteEmails}
                  className={cn(
                    defaultTextProps,
                    'flex h-10 max-h-10 w-full resize-none py-5 pl-3 pr-32 focus:outline-none focus:ring-0 focus:ring-opacity-0 focus:ring-offset-0'
                  )}
                />
                <Dropdown
                  value={inviteRole}
                  onChange={(value) => setInviteRole(value)}
                  options={
                    authUser?.role === 'ADMIN' ? adminDropdownOptions : parentDropdownOptions
                  }
                  containerClassName="absolute right-1 bottom-1"
                  className="cursor-pointer py-1"
                />
              </div>
              <span className="text-xs dark:text-gray-500">
                You can add comma separated emails to invite multiple users at once
              </span>
            </div>
          </div>
        }
        buttons={
          <DialogButton
            onClick={handleInviteSend}
            disabled={!inviteEmails.length}
            className="dark:hover:gray-400 border-gray-700 bg-green-600 text-white hover:bg-green-700 dark:hover:bg-green-800"
          >
            {inviteEmails.length === 1
              ? `Invite 1 member`
              : `Invite ${inviteEmails.length} members`}
          </DialogButton>
        }
        selection={null}
      />
    </Dialog>
  );
}
