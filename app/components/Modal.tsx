import React, { useEffect } from 'react'
import styles from './Modal.module.css'

interface ModalProps {
    isOpen: boolean
    title: string
    message: string
    onConfirm: () => void
    onCancel: () => void
    confirmText?: string
    cancelText?: string
    isAlert?: boolean // If true, only show OK button
}

export default function Modal({
    isOpen,
    title,
    message,
    onConfirm,
    onCancel,
    confirmText = "Confirm",
    cancelText = "Cancel",
    isAlert = false
}: ModalProps) {
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onCancel()
        }
        if (isOpen) {
            window.addEventListener('keydown', handleEsc)
        }
        return () => window.removeEventListener('keydown', handleEsc)
    }, [isOpen, onCancel])

    if (!isOpen) return null

    return (
        <div className={styles.overlay} onClick={(e) => {
            if (e.target === e.currentTarget) onCancel()
        }}>
            <div className={styles.modal}>
                <h3 className={styles.title}>{title}</h3>
                <p className={styles.message}>{message}</p>
                <div className={styles.actions}>
                    {!isAlert && (
                        <button className={styles.cancelBtn} onClick={onCancel}>
                            {cancelText}
                        </button>
                    )}
                    <button className={styles.confirmBtn} onClick={onConfirm}>
                        {isAlert ? "OK" : confirmText}
                    </button>
                </div>
            </div>
        </div>
    )
}
