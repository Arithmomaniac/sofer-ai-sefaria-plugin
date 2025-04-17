import React, { useState, useEffect, useMemo } from 'react';
import { useStore, Status } from './store';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';

export default function SefariaPlugin({ sref, shadowRootContainer }: { sref?: string, shadowRootContainer: ShadowRoot }) {
  // Define the theme inside the component
  const theme = useMemo(() => createTheme(), []);

  // Create Emotion cache targeting the shadow DOM container
  const styleCache = useMemo(() => {
    return createCache({
      key: 'mui-shadow-dom',
      container: shadowRootContainer,
    });
  }, [shadowRootContainer]);

  // Get state and actions from Zustand store
  const {
    status,
    displayText,
    apiKey,
    transcriptionId,
    updateSettingsAndFetch
  } = useStore();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const key = formData.get('apiKey') as string;
    const id = formData.get('transcriptionId') as string;
    updateSettingsAndFetch(key, id);
  };

  return (
    <CacheProvider value={styleCache}>
      <ThemeProvider theme={theme}>
        <Box sx={{ p: 2 }}>
          <Box sx={{ mt: 1, mb: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
            {status === Status.Loading && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CircularProgress size={20} />
            <Typography variant="body1">🤖 is loading...</Typography>
          </Box>
        )}
        {status === Status.Error && (
          <Alert severity="error">
            <Typography variant="h6">🤖 🤒</Typography>
            Whoops! Something went wrong.
          </Alert>
        )}
        {status === Status.Finished && (
          <Typography>Ref: {displayText}</Typography>
        )}
      </Box>

      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Typography variant="h6">Sofer.Ai Settings</Typography>
        <TextField
          name="apiKey"
          label="API Key"
          variant="outlined"
          size="small"
          defaultValue={apiKey}
          fullWidth
        />
        <TextField
          name="transcriptionId"
          label="Transcription ID"
          variant="outlined"
          size="small"
          defaultValue={transcriptionId}
          fullWidth
        />
        <Button type="submit" variant="contained">Update</Button>
      </Box>

      <Typography variant="caption" display="block" sx={{ mt: 2 }}>
            Ref: {sref}
          </Typography>
        </Box>
      </ThemeProvider>
    </CacheProvider>
  );
}
