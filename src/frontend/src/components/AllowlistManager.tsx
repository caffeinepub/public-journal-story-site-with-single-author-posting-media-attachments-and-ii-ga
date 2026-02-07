import { useState } from 'react';
import { useGrantAccess, useRevokeAccess, useHasAccess } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { UserPlus, UserMinus, Search } from 'lucide-react';
import { toast } from 'sonner';
import { validatePrincipal } from '../utils/principal';

export default function AllowlistManager() {
  const [principalInput, setPrincipalInput] = useState('');
  const [checkPrincipal, setCheckPrincipal] = useState('');
  const grantAccess = useGrantAccess();
  const revokeAccess = useRevokeAccess();
  const { data: hasAccess, refetch: checkAccess } = useHasAccess(checkPrincipal);

  const handleGrant = async () => {
    const validation = validatePrincipal(principalInput);
    if (!validation.valid) {
      toast.error(validation.error);
      return;
    }

    try {
      await grantAccess.mutateAsync(validation.principal!);
      toast.success('Access granted successfully');
      setPrincipalInput('');
    } catch (error) {
      toast.error('Failed to grant access');
      console.error(error);
    }
  };

  const handleRevoke = async () => {
    const validation = validatePrincipal(principalInput);
    if (!validation.valid) {
      toast.error(validation.error);
      return;
    }

    try {
      await revokeAccess.mutateAsync(validation.principal!);
      toast.success('Access revoked successfully');
      setPrincipalInput('');
    } catch (error) {
      toast.error('Failed to revoke access');
      console.error(error);
    }
  };

  const handleCheck = async () => {
    const validation = validatePrincipal(checkPrincipal);
    if (!validation.valid) {
      toast.error(validation.error);
      return;
    }

    await checkAccess();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-serif">Access Control</CardTitle>
        <CardDescription>
          Manage who can view locked content
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="principal">Principal ID</Label>
            <Input
              id="principal"
              value={principalInput}
              onChange={(e) => setPrincipalInput(e.target.value)}
              placeholder="Enter principal ID"
              className="font-mono text-sm"
            />
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleGrant}
              disabled={grantAccess.isPending || !principalInput}
              className="flex-1"
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Grant
            </Button>
            <Button
              onClick={handleRevoke}
              disabled={revokeAccess.isPending || !principalInput}
              variant="outline"
              className="flex-1"
            >
              <UserMinus className="mr-2 h-4 w-4" />
              Revoke
            </Button>
          </div>
        </div>

        <div className="pt-4 border-t space-y-4">
          <div className="space-y-2">
            <Label htmlFor="check-principal">Check Access</Label>
            <div className="flex gap-2">
              <Input
                id="check-principal"
                value={checkPrincipal}
                onChange={(e) => setCheckPrincipal(e.target.value)}
                placeholder="Enter principal ID"
                className="font-mono text-sm"
              />
              <Button onClick={handleCheck} disabled={!checkPrincipal} variant="secondary">
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>
          {checkPrincipal && hasAccess !== undefined && (
            <p className="text-sm">
              Status: <span className={hasAccess ? 'text-green-600 font-medium' : 'text-muted-foreground'}>
                {hasAccess ? 'Has Access' : 'No Access'}
              </span>
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
