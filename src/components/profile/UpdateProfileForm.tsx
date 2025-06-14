import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { useCells } from '@/hooks/useCells';
import { useTeams } from '@/hooks/useTeams';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const profileFormSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  phone: z.string().optional(),
  cell_id: z.string().optional(),
  team_id: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export const UpdateProfileForm = () => {
  const { user, refetchUser } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = React.useState(true);
  const { cells, loading: cellsLoading } = useCells();
  const { teams, loading: teamsLoading } = useTeams();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      email: '',
      name: '',
      phone: '',
      cell_id: '',
      team_id: '',
    },
  });

  useEffect(() => {
    if (user) {
      setLoading(true);
      Promise.all([
        supabase
          .from('profiles')
          .select('phone, cell_id')
          .eq('id', user.id)
          .single(),
        supabase
          .from('team_members')
          .select('team_id')
          .eq('user_id', user.id)
          .maybeSingle()
      ]).then(([{ data: profileData, error: profileError }, { data: teamData, error: teamError }]) => {
          form.reset({
            name: user.name,
            email: user.email,
            phone: profileData?.phone || '',
            cell_id: profileData?.cell_id || '',
            team_id: teamData?.team_id || '',
          });

          if (profileError && profileError.code !== 'PGRST116') {
            toast({ title: "Error fetching profile data", description: profileError.message, variant: "destructive" });
          }
          if (teamError) {
            toast({ title: "Error fetching team data", description: teamError.message, variant: "destructive" });
          }
          setLoading(false);
        });
    }
  }, [user, form, toast]);

  const onSubmit = async (data: ProfileFormValues) => {
    if (!user) return;

    const { error } = await supabase.rpc('update_user_profile_and_team', {
      p_user_id: user.id,
      p_name: data.name,
      p_phone: data.phone || null,
      p_cell_id: data.cell_id || null,
      p_team_id: data.team_id || null,
    });

    if (error) {
      toast({ title: "Error updating profile", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Profile updated successfully" });
      await refetchUser();
    }
  };

  if (loading || cellsLoading || teamsLoading) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>Update your personal information.</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-40">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Profile Information</CardTitle>
        <CardDescription>Update your personal information.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="Your email" {...field} disabled />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Your name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input placeholder="Your phone number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="cell_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cell</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || ''}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a cell" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="">No cell assigned</SelectItem>
                      {cells.map((cell) => (
                        <SelectItem key={cell.id} value={cell.id}>
                          {cell.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="team_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Team</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || ''}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a team" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="">No team assigned</SelectItem>
                      {teams.map((team) => (
                        <SelectItem key={team.id} value={team.id}>
                          {team.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Profile
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
