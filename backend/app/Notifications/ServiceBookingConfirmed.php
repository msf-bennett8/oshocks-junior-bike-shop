<?php

namespace App\Notifications;

use App\Models\ServiceBooking;
use App\Models\SupportCase;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ServiceBookingConfirmed extends Notification implements ShouldQueue
{
    use Queueable;

    protected ServiceBooking $booking;
    protected SupportCase $supportCase;

    public function __construct(ServiceBooking $booking, SupportCase $supportCase)
    {
        $this->booking = $booking;
        $this->supportCase = $supportCase;
    }

    public function via($notifiable): array
    {
        $channels = ['database'];

        // Check notification preferences
        $settings = $notifiable->notificationSettings ?? null;
        
        if (!$settings || $settings->email_booking_confirmations !== false) {
            $channels[] = 'mail';
        }
        
        if (!$settings || $settings->sms_booking_confirmations !== false) {
            $channels[] = 'sms'; // Requires custom SMS channel
        }

        return $channels;
    }

    public function toMail($notifiable): MailMessage
    {
        $confirmedDate = $this->booking->confirmed_date 
            ? \Carbon\Carbon::parse($this->booking->confirmed_date)->format('l, F j, Y \a\t g:i A')
            : 'Pending confirmation';

        return (new MailMessage)
            ->subject('✅ Your Service Appointment is Confirmed — ' . $this->supportCase->case_id)
            ->greeting('Hello ' . ($notifiable->name ?? 'Valued Customer') . '!')
            ->line('Great news! Your service appointment has been confirmed.')
            ->line('')
            ->line('**Appointment Details:**')
            ->line('• Case ID: ' . $this->supportCase->case_id)
            ->line('• Service: ' . ucwords(str_replace('_', ' ', $this->booking->service_type)))
            ->line('• Date & Time: ' . $confirmedDate)
            ->line('• Shop Location: ' . ($this->booking->shop_location ?? 'Main Store - Nairobi'))
            ->line('')
            ->line('**Assigned To:**')
            ->line($this->booking->seller?->shop_name ?? $this->booking->assignedMechanic?->name ?? 'Our expert team')
            ->line('')
            ->action('View Appointment', url('/dashboard/appointments'))
            ->line('Need to reschedule? Reply to this email or contact us at oshocksstores@gmail.com')
            ->salutation('Thank you for choosing Oshocks! 🚴‍♂️');
    }

    public function toDatabase($notifiable): array
    {
        return [
            'type' => 'booking_confirmed',
            'title' => 'Appointment Confirmed',
            'message' => 'Your ' . ucwords(str_replace('_', ' ', $this->booking->service_type)) . ' appointment has been confirmed for ' . 
                \Carbon\Carbon::parse($this->booking->confirmed_date)->format('M j, Y g:i A'),
            'case_id' => $this->supportCase->case_id,
            'booking_id' => $this->booking->id,
            'action_url' => '/dashboard/appointments',
            'icon' => 'calendar-check',
            'color' => 'emerald',
        ];
    }

    public function toSms($notifiable): array
    {
        return [
            'message' => 'Oshocks: Your ' . ucwords(str_replace('_', ' ', $this->booking->service_type)) . 
                ' appointment is confirmed for ' . 
                \Carbon\Carbon::parse($this->booking->confirmed_date)->format('M j, g:i A') . 
                '. Case: ' . $this->supportCase->case_id,
        ];
    }
}
