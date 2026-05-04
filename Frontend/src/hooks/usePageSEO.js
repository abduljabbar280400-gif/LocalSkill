import { useEffect } from 'react';

const usePageSEO = ({ title, description, keywords = '', canonical = '' }) => {
  useEffect(() => {
    // Set Title
    document.title = title ? `${title} | LocalSkill` : 'LocalSkill – Hire Local Freelancers & Find Projects';

    // Set Description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', description || 'LocalSkill connects clients with skilled local freelancers. Post projects, receive proposals, and hire the best talent near you.');
    } else {
      metaDescription = document.createElement('meta');
      metaDescription.name = 'description';
      metaDescription.content = description;
      document.head.appendChild(metaDescription);
    }

    // Set Keywords
    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metaKeywords) {
      metaKeywords.setAttribute('content', keywords);
    } else {
      metaKeywords = document.createElement('meta');
      metaKeywords.name = 'keywords';
      metaKeywords.content = keywords;
      document.head.appendChild(metaKeywords);
    }

    // Set Canonical
    let linkCanonical = document.querySelector('link[rel="canonical"]');
    const defaultCanonical = window.location.origin + window.location.pathname;
    if (linkCanonical) {
      linkCanonical.setAttribute('href', canonical || defaultCanonical);
    } else {
      linkCanonical = document.createElement('link');
      linkCanonical.rel = 'canonical';
      linkCanonical.href = canonical || defaultCanonical;
      document.head.appendChild(linkCanonical);
    }

    // Cleanup (optional, but good if you want to revert to default on unmount)
    return () => {
      // document.title = 'LocalSkill';
    };
  }, [title, description, keywords, canonical]);
};

export default usePageSEO;
