const UserProfileCard = ({ user }) => {
  return (
    <div className="bg-[#1D4E4E]/30 p-6 rounded-lg">
      <h2 className="text-2xl font-bold text-[#4CAF50]">User Profile</h2>
      <div className="mt-4">
        <p className="text-lg text-[#81C784]">
          <strong>Name:</strong> {user.name}
        </p>
        <p className="text-lg text-[#81C784]">
          <strong>Email:</strong> {user.email}
        </p>
      </div>
    </div>
  );
};

export default UserProfileCard;
