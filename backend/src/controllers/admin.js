export function getDashboard(req, res) {
  const { firebaseUid, email, displayName, role } = req.adminUser;
  return res.status(200).json({
    message: "Admin access granted.",
    admin: { firebaseUid, email, displayName, role },
  });
}