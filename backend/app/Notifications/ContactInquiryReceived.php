<?php

namespace App\Notifications;

use App\Models\SupportCase;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ContactInquiryReceived extends Notification implements ShouldQueue
{
    use Queueable;

    protected SupportCase $supportCase;
    protected bool $isAutoReply;

    public function __construct(SupportCase $supportCase, bool $isAutoReply = true)
    {
        $this->supportCase = $supportCase;
        $this->isAutoReply = $isAutoReply;
    }

    public function via($notifiable): array
    {
        $channels = ['database', 'mail'];

        $settings = $notifiable->notificationSettings ?? null;
        if ($settings && $settings->sms_inquiry_replies === true) {
            $channels[] = 'sms';
        }

        return $channels;
    }

    public function toMail($notifiable): MailMessage
    {
        $mail = (new MailMessage)
            ->subject('📬 We Received Your Message — ' . $this->supportCase->case_id)
            ->greeting('Hello ' . ($notifiable->name ?? 'there') . '!')
            ->line('Thank you for contacting Oshocks. We have received your inquiry and our support team will respond shortly.')
            ->line('')
            ->line('**Your Inquiry Details:**')
            ->line('• Case ID: ' . $this->supportCase->case_id)
            ->line('• Subject: ' . $this->supportCase->subject)
            ->line('• Department: ' . ucwords(str_replace('_', ' ', $this->supportCase->department ?? 'General')))
            ->line('• Priority: ' . ucfirst($this->supportCase->priority))
            ->line('')
            ->line('**What happens next?**')
            ->line('1. Our team reviews your inquiry (usually within 1-2 hours)')
            ->line('2. You will receive a response via email and in-app notification')
            ->line('3. If urgent, you can start a live chat from your dashboard')
            ->line('')
            ->action('Track Your Inquiry', url('/dashboard/support-cases'))
            ->line('For urgent matters, call us at +254 715 061 213')
            ->salutation('The Oshocks Support Team 🚴‍♂️');

        return $mail;
    }

    public function toDatabase($notifiable): array
    {
        return [
            'type' => 'inquiry_received',
            'title' => 'Inquiry Received',
            'message' => 'We received your inquiry: "' . \Str::limit($this->supportCase->subject, 50) . '"',
            'case_id' => $this->supportCase->case_id,
            'action_url' => '/dashboard/support-cases/' . $this->supportCase->case_id,
            'icon' => 'mail',
            'color' => 'blue',
        ];
    }

    public function toSms($notifiable): array
    {
        return [
            'message' => 'Oshocks: We received your inquiry (' . $this->supportCase->case_id . 
                '). We will reply within 24hrs. Track: ' . url('/dashboard/support-cases'),
        ];
    }
}
