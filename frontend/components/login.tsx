
import * as React from 'react';
import {
  Button,
  FormControl,
  Checkbox,
  FormControlLabel,
  InputLabel,
  OutlinedInput,
  TextField,
  InputAdornment,
  Link,
  Alert,
  IconButton,
} from '@mui/material';
import AccountCircle from '@mui/icons-material/AccountCircle';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { AppProvider } from '@toolpad/core/AppProvider';
import { SignInPage } from '@toolpad/core/SignInPage';
import { useTheme } from '@mui/material/styles';

const providers = [{ id: 'credentials', name: 'Email and Password' }];

function CustomButton() {
  return (
    <Button
      type="submit"
      variant="outlined"
      color="info"
      size="small"
      disableElevation
      fullWidth
      sx={{ my: 2 }}
    >
      Log In
    </Button>
  );
}

function SignUpLink() {
  return (
    <Link href="/" variant="body2">
      Sign up
    </Link>
  );
}

function ForgotPasswordLink() {
  return (
    <Link href="/" variant="body2">
      Forgot password?
    </Link>
  );
}

function Title() {
  return <h2 style={{ marginBottom: 8 }}>Login</h2>;
}

function Subtitle() {
  return (
    <Alert sx={{ mb: 2, px: 1, py: 0.25, width: '100%' }} severity="warning">
      We are investigating an ongoing outage.
    </Alert>
  );
}

function RememberMeCheckbox() {
  const theme = useTheme();
  return (
    <FormControlLabel
      label="Remember me"
      control={
        <Checkbox
          name="remember"
          value="true"
          color="primary"
          sx={{ padding: 0.5, '& .MuiSvgIcon-root': { fontSize: 20 } }}
        />
      }
      slotProps={{
        typography: {
          color: 'textSecondary',
          fontSize: theme.typography.pxToRem(14),
        },
      }}
    />
  );
}

export default function SlotsSignIn() {
  const theme = useTheme();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");

  const [showPassword, setShowPassword] = React.useState(false);

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleMouseDownPassword = (event: React.MouseEvent) => {
    event.preventDefault();
  };

  return (
    <AppProvider theme={theme}>
      <SignInPage
        signIn={(provider: any, formData: any) =>
          alert(
            `Logging in with "${provider.name}" and credentials: ${formData.get('email')}, ${formData.get('password')}, and checkbox value: ${formData.get('remember')}`,
          )
        }
        slots={{
          title: Title,
          subtitle: Subtitle,
          emailField: () => (
            <TextField
                id="input-with-icon-textfield"
                label="Email"
                name="email"
                type="email"
                size="small"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                fullWidth
                slotProps={{
                    input: {
                    startAdornment: (
                        <InputAdornment position="start">
                        <AccountCircle fontSize="inherit" />
                        </InputAdornment>
                    ),
                    },
                }}
                variant="outlined"
            />
          ),
          passwordField: () => (
            <FormControl sx={{ my: 2 }} fullWidth variant="outlined">
                <InputLabel size="small" htmlFor="outlined-adornment-password">
                    Password
                </InputLabel>
                <OutlinedInput
                    id="outlined-adornment-password"
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    size="small"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    endAdornment={
                    <InputAdornment position="end">
                        <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleClickShowPassword}
                        onMouseDown={handleMouseDownPassword}
                        edge="end"
                        size="small"
                        >
                        {showPassword ? (
                            <VisibilityOff fontSize="inherit" />
                        ) : (
                            <Visibility fontSize="inherit" />
                        )}
                        </IconButton>
                    </InputAdornment>
                    }
                    label="Password"
                />
            </FormControl>
          ),
          submitButton: CustomButton,
          signUpLink: SignUpLink,
          rememberMe: RememberMeCheckbox,
          forgotPasswordLink: ForgotPasswordLink,
        }}
        slotProps={{ form: { noValidate: true } }}
        providers={providers}
      />
    </AppProvider>
  );
}
