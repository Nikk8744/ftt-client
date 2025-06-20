'use client';

import { useEffect, useState, useRef, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { XMarkIcon } from '@heroicons/react/24/outline';
import Button from './Button';
import { cn } from '@/lib/utils';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  closeOnClickOutside?: boolean;
  showCloseButton?: boolean;
  description?: string;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  maxWidth = 'md',
  closeOnClickOutside = true,
  showCloseButton = true,
  description,
}: ModalProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const backdropRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Trigger animation after mount
      requestAnimationFrame(() => {
        setIsVisible(true);
      });
    } else {
      document.body.style.overflow = 'auto';
      setIsVisible(false);
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    // Focus trap
    const handleTab = (e: KeyboardEvent) => {
      if (!modalRef.current || e.key !== 'Tab') return;

      const focusableElements = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.addEventListener('keydown', handleTab);
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('keydown', handleTab);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen && modalRef.current) {
      const focusableElement = modalRef.current.querySelector(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      ) as HTMLElement;
      if (focusableElement) {
        focusableElement.focus();
      }
    }
  }, [isOpen]);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (closeOnClickOutside && backdropRef.current === e.target) {
      onClose();
    }
  };

  const widthClasses = {
    xs: 'max-w-xs',
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    full: 'max-w-[calc(100%-2rem)]',
  };

  if (!isMounted) return null;

  return createPortal(
    <div
      className={cn(
        "fixed inset-0 z-[110] flex items-center justify-center overflow-y-auto bg-black/50 p-4 transition-opacity duration-300",
        isVisible ? "opacity-100" : "opacity-0",
        !isOpen && "pointer-events-none"
      )}
      ref={backdropRef}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "modal-title" : undefined}
      aria-describedby={description ? "modal-description" : undefined}
    >
      <div
        ref={modalRef}
        className={cn(
          "relative w-full rounded-lg bg-white shadow-xl transition-all duration-300",
          widthClasses[maxWidth],
          isVisible 
            ? "translate-y-0 opacity-100" 
            : "translate-y-4 opacity-0"
        )}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
            <div>
              {title && (
                <h3 
                  id="modal-title"
                  className="text-lg font-medium text-gray-900"
                >
                  {title}
                </h3>
              )}
              {description && (
                <p 
                  id="modal-description"
                  className="mt-1 text-sm text-gray-500"
                >
                  {description}
                </p>
              )}
            </div>
            {showCloseButton && (
              <button 
                type="button"
                onClick={onClose}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                aria-label="Close modal"
              >
                <XMarkIcon className="h-5 w-5" aria-hidden="true" />
              </button>
            )}
          </div>
        )}
        
        {/* Body */}
        <div className="px-6 py-4 max-h-[calc(100vh-16rem)] overflow-y-auto">
          {children}
        </div>
        
        {/* Footer */}
        {footer && (
          <div className="border-t border-gray-200 px-6 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
  variant?: 'primary' | 'danger' | 'warning';
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isLoading = false,
  variant = 'primary',
}: ConfirmModalProps) {
  // Map the variant to Button component variants
  const getButtonVariant = (variant: 'primary' | 'danger' | 'warning') => {
    switch (variant) {
      case 'danger':
        return 'destructive';
      case 'warning':
        return 'secondary';
      default:
        return 'default';
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      maxWidth="sm"
      footer={
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="min-w-[80px] mx-2"
          >
            {cancelText}
          </Button>
          <Button
            variant={getButtonVariant(variant)}
            onClick={onConfirm}
            isLoading={isLoading}
            className="min-w-[80px]"
          >
            {confirmText}
          </Button>
        </div>
      }
    >
      <p className="text-gray-700">{message}</p>
    </Modal>
  );
}