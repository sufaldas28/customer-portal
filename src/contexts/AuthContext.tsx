import React, { createContext, useContext, useState, useEffect } from 'react';

export interface UserProfile {
full_name?: string;
email?: string;
company?: string;
}

interface AuthContextType {
  user: any | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (fullName: string, email: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
user: null,
profile: null,
loading: true,
signIn: async () => ({ error: null }),
signUp: async () => ({ error: null }),
signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
const [user, setUser] = useState<any | null>(null);
const [profile, setProfile] = useState<UserProfile | null>(null);
const [loading, setLoading] = useState(true);

// 🔹 Check login on page load
useEffect(() => {
const storedUser = localStorage.getItem("user");


if (storedUser) {
  const parsedUser = JSON.parse(storedUser);
  setUser(parsedUser);
  setProfile({
    full_name: parsedUser?.full_name || "",
    email: parsedUser?.email || "",
    company: parsedUser?.company || ""
  });
}

setLoading(false);


}, []);

// 🔹 LOGIN USING YOUR API
const signIn = async (email: string, password: string): Promise<{ error: string | null }> => {
try {
const res = await fetch('http://192.168.101.185/api/method/login', {
method: 'POST',
credentials: "include",
headers: {
'Accept': 'application/json',
'Content-Type': 'application/json',
},
body: JSON.stringify({
usr: email,
pwd: password
})
});


  const data = await res.json();

  if (!res.ok || data?.message !== "Logged In") {
    return { error: data?.message || "Invalid email or password" };
  }

  // Save user session
  localStorage.setItem("user", JSON.stringify({
    email: email
  }));

  setUser({ email });

  setProfile({
    email
  });

  return { error: null };

} catch (err: any) {
  return { error: "Server error. Please try again." };
}
};
const signUp = async (fullName: string, email: string): Promise<{ error: string | null }> => {
  try {
    const res = await fetch('http://192.168.101.185/api/method/frappe.core.doctype.user.user.sign_up', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        full_name: fullName,
        redirect_to: "/"
      })
    });

    const data = await res.json();

    if (!res.ok) {
      return { error: data?.message || "Signup failed" };
    }

    return { error: null };

  } catch (err) {
    return { error: "Server error. Please try again." };
  }
};
// 🔹 LOGOUT USING API
const signOut = async () => {
try {
await fetch("http://192.168.101.185/api/method/logout", {
method: "POST",
credentials: "include"
});
} catch {}


localStorage.removeItem("user");
setUser(null);
setProfile(null);


};

return (
<AuthContext.Provider value={{
  user,
  profile,
  loading,
  signIn,
  signUp,
  signOut
}}>
{children}
</AuthContext.Provider>
);
};
