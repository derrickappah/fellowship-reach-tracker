
import { UpdateProfileForm } from './UpdateProfileForm';
import { UpdatePasswordForm } from './UpdatePasswordForm';

export const ProfileSettings = () => {
  return (
    <div className="space-y-8">
      <UpdateProfileForm />
      <UpdatePasswordForm />
    </div>
  );
};
