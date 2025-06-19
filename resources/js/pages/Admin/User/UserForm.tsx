import { useForm } from '@inertiajs/react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useEffect } from 'react';

interface Props {
  close: () => void;
  user?: {
    id: number;
    name: string;
    email: string;
    role: string;
  } | null;
}

export default function UserForm({ close, user }: Props) {
  const isEdit = !!user;
  const {
    data,
    setData,
    post,
    put,
    processing,
    errors,
    reset,
  } = useForm({
    name: user?.name || '',
    email: user?.email || '',
    role: (user?.role as 'admin' | 'student') || 'student',
  });

  useEffect(() => {
    if (!isEdit) {
      reset({ name: '', email: '', role: 'student' });
    }
  }, [isEdit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEdit && user) {
      put(route('admin.users.update', user.id), {
        onSuccess: () => {
          toast.success('User updated successfully');
          close();
        },
        onError: (errors) => {
          toast.error('Failed to update user');
        },
      });
    } else {
      post(route('admin.users.store'), {
        onSuccess: () => {
          toast.success('User created successfully');
          close();
        },
        onError: (errors) => {
          toast.error('Failed to create user');
        },
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-6">
      <div>
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          value={data.name}
          onChange={(e) => setData('name', e.target.value)}
          required
        />
        {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={data.email}
          onChange={(e) => setData('email', e.target.value)}
          required
        />
        {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
      </div>
      <div>
        <Label htmlFor="role">Role</Label>
        <Select value={data.role} onValueChange={(v) => setData('role', v as 'admin' | 'student')}>
          <SelectTrigger className="mt-1 w-full">
            <SelectValue placeholder="Select role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="student">Student</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
        {errors.role && <p className="text-xs text-red-500 mt-1">{errors.role}</p>}
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={close} disabled={processing}>
          Cancel
        </Button>
        <Button type="submit" disabled={processing}>
          {isEdit ? 'Update User' : 'Create User'}
        </Button>
      </div>
    </form>
  );
}
