import { ActivityIcon } from "lucide-react";
import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#0F2C2C] text-[ #E0F2F1] py-8">
      <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
        <div className="flex items-center space-x-3">
          <ActivityIcon className="h-8 w-8 text-[#4CAF50]" />
          <span className="text-lg font-bold">Sports Buddy</span>
        </div>
        <div className="flex space-x-4 mt-4 md:mt-0">
          <a
            href="https://facebook.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Facebook className="h-6 w-6 text-[#4CAF50] hover:text-[#81C784]" />
          </a>
          <a
            href="https://twitter.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Twitter className="h-6 w-6 text-[#4CAF50] hover:text-[#81C784]" />
          </a>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Instagram className="h-6 w-6 text-[#4CAF50] hover:text-[#81C784]" />
          </a>
          <a
            href="https://linkedin.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Linkedin className="h-6 w-6 text-[#4CAF50] hover:text-[#81C784]" />
          </a>
        </div>
      </div>
      <div className="text-center mt-4">
        <p className="text-sm">
          © {currentYear} Sports Buddy. All rights reserved.
        </p>
        <p>
          Designed and Developed by{" "}
          <a
            href="https://github.com/imprince26"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#4CAF50] hover:text-[#81C784]"
          >
            Prince Patel
          </a>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
