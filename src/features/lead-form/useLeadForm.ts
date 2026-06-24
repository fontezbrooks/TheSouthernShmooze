import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { leadSchema, emptyLeadForm, type LeadFormValues } from './leadSchema';
import { submitLead } from './submitLead';

export type SubmitStatus = 'idle' | 'submitting' | 'success' | 'error';

/** Form state + submission orchestration for the lead form. */
export function useLeadForm() {
  const form = useForm<LeadFormValues>({
    resolver: zodResolver(leadSchema),
    defaultValues: emptyLeadForm,
    mode: 'onTouched',
  });

  const [status, setStatus] = useState<SubmitStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const onSubmit = form.handleSubmit(async (values) => {
    // Honeypot: a filled `company` field means a bot. Pretend success, don't submit.
    if (values.company && values.company.length > 0) {
      setStatus('success');
      return;
    }

    setStatus('submitting');
    setErrorMessage(null);

    const result = await submitLead(values);
    if (result.ok) {
      form.reset(emptyLeadForm);
      setStatus('success');
    } else {
      setErrorMessage(result.error);
      setStatus('error');
    }
  });

  const reset = () => {
    setStatus('idle');
    setErrorMessage(null);
  };

  return { form, status, errorMessage, onSubmit, reset };
}
