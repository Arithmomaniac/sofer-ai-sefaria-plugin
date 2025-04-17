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
import Link from '@mui/material/Link'; // Import Link for hyperlinks
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';

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
    updateSettingsAndFetch,
    // Get ref state
    refsLoading,
    refsList,
    refsError
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
          {/* Refs Pane */}
          <Box sx={{ mt: 1, mb: 2, p: 2, border: '1px solid', borderColor: 'grey.300', borderRadius: 1, minHeight: '60px' }}>
            <Typography variant="subtitle2" gutterBottom>References</Typography>
            {refsLoading && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircularProgress size={16} />
                <Typography variant="body2">Loading refs...</Typography>
              </Box>
            )}
            {refsError && (
              <Alert severity="warning" sx={{ mt: 1 }}>{refsError}</Alert>
            )}
            {!refsLoading && !refsError && refsList && (
              refsList.length > 0 ? (
                <List dense disablePadding sx={{ maxHeight: 150, overflow: 'auto' }}>
                  {refsList.map(ref => (
                    <ListItem key={ref.text} disableGutters dense>
                      <Link
                        href={`https://www.sefaria.org/${ref.url}`} // Ensure spaces are underscores for URL
                        target="_blank"
                        rel="noopener noreferrer"
                        variant="body2"
                        underline="hover"
                      >
                        {ref.text}
                      </Link>
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>No references found.</Typography>
              )
            )}
             {!refsLoading && !refsError && !refsList && (
                 <Typography variant="body2" sx={{ color: 'text.secondary' }}> </Typography> // Placeholder or initial state before first load
             )}
          </Box>

          {/* Transcript Pane */}
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
