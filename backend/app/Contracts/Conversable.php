<?php

namespace App\Contracts;

interface Conversable
{
    public function conversation(): ?\Illuminate\Database\Eloquent\Relations\BelongsTo;
    public function getConversationSubject(): string;
    public function getConversationContext(): array;
}

