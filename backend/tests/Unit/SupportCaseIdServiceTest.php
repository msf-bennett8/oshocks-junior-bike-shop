<?php

namespace Tests\Unit;

use App\Services\SupportCaseIdService;
use Carbon\Carbon;
use PHPUnit\Framework\TestCase;

class SupportCaseIdServiceTest extends TestCase
{
    protected SupportCaseIdService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new SupportCaseIdService();
    }

    public function test_generates_valid_case_id_format(): void
    {
        $id = $this->service->generate('order_issue');

        $this->assertEquals(13, strlen($id));
        $this->assertTrue(ctype_alpha(substr($id, 0, 6)));
        $this->assertTrue(ctype_digit($id[6]));
        $this->assertTrue(ctype_digit($id[7]));
        $this->assertTrue(ctype_alpha(substr($id, 8, 3)));
    }

    public function test_year_encoding_starts_at_2026(): void
    {
        $id = $this->service->generate('order_issue', Carbon::create(2026, 5, 20, 14, 30));
        $this->assertEquals('A', $id[0]);
    }

    public function test_year_encoding_for_2027(): void
    {
        $id = $this->service->generate('order_issue', Carbon::create(2027, 1, 1));
        $this->assertEquals('B', $id[0]);
    }

    public function test_month_encoding(): void
    {
        $id = $this->service->generate('order_issue', Carbon::create(2026, 1, 15));
        $this->assertEquals('A', $id[1]); // January = A

        $id = $this->service->generate('order_issue', Carbon::create(2026, 5, 15));
        $this->assertEquals('E', $id[1]); // May = E

        $id = $this->service->generate('order_issue', Carbon::create(2026, 12, 15));
        $this->assertEquals('L', $id[1]); // December = L
    }

    public function test_case_type_digits(): void
    {
        $this->assertEquals('7', $this->service->generate('order_issue')[7]);
        $this->assertEquals('5', $this->service->generate('account_help')[7]);
        $this->assertEquals('3', $this->service->generate('report_problem')[7]);
        $this->assertEquals('8', $this->service->generate('delivery_question')[7]);
    }

    public function test_invalid_case_type_throws_exception(): void
    {
        $this->expectException(\InvalidArgumentException::class);
        $this->service->generate('invalid_type');
    }

    public function test_parse_reverses_generation(): void
    {
        $timestamp = Carbon::create(2026, 5, 20, 14, 35);
        $id = $this->service->generate('order_issue', $timestamp);
        $parsed = $this->service->parse($id);

        $this->assertEquals(2026, $parsed['year']);
        $this->assertEquals(5, $parsed['month']);
        $this->assertEquals(20, $parsed['day']);
        $this->assertEquals(14, $parsed['hour']);
        $this->assertEquals(35, $parsed['minute']);
        $this->assertEquals('order_issue', $parsed['case_type']);
        $this->assertEquals('7', $parsed['type_digit']);
    }

    public function test_is_valid_returns_true_for_valid_id(): void
    {
        $id = $this->service->generate('order_issue');
        $this->assertTrue($this->service->isValid($id));
    }

    public function test_is_valid_returns_false_for_invalid_id(): void
    {
        $this->assertFalse($this->service->isValid('INVALID'));
        $this->assertFalse($this->service->isValid('1234567890123'));
        $this->assertFalse($this->service->isValid('ABCDEFGHIJKLM'));
    }

    public function test_uniqueness_across_multiple_generations(): void
    {
        $ids = [];
        for ($i = 0; $i < 100; $i++) {
            $ids[] = $this->service->generate('order_issue');
        }
        $this->assertEquals(100, count(array_unique($ids)));
    }
}
