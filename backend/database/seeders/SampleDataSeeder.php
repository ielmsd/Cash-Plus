<?php

namespace Database\Seeders;

use App\Models\AppNotification;
use App\Models\BillPayment;
use App\Models\Customer;
use App\Models\Transaction;
use App\Models\Transfer;
use App\Models\User;
use Illuminate\Database\Seeder;

class SampleDataSeeder extends Seeder
{
    public function run(): void
    {
        $agent = User::whereHas('roles', fn($q) => $q->where('name', 'agent'))->first();

        $customers = [
            ['first_name' => 'Ahmed', 'last_name' => 'Khalil', 'cin' => 'AB123456', 'phone' => '+212611111111', 'email' => 'ahmed@email.com', 'city' => 'Casablanca', 'gender' => 'male'],
            ['first_name' => 'Samira', 'last_name' => 'Tahir', 'cin' => 'CD234567', 'phone' => '+212622222222', 'email' => 'samira@email.com', 'city' => 'Rabat', 'gender' => 'female'],
            ['first_name' => 'Omar', 'last_name' => 'Berrada', 'cin' => 'EF345678', 'phone' => '+212633333333', 'city' => 'Marrakech', 'gender' => 'male'],
            ['first_name' => 'Nadia', 'last_name' => 'Benali', 'cin' => 'GH456789', 'phone' => '+212644444444', 'city' => 'Fès', 'gender' => 'female'],
            ['first_name' => 'Hassan', 'last_name' => 'Qadri', 'cin' => 'IJ567890', 'phone' => '+212655555555', 'city' => 'Tanger', 'gender' => 'male'],
        ];

        $createdCustomers = [];
        foreach ($customers as $data) {
            $data['agent_id'] = $agent?->id;
            $data['status'] = 'active';
            $createdCustomers[] = Customer::firstOrCreate(['cin' => $data['cin']], $data);
        }

        $billProviders = [
            ['type' => 'electricity', 'provider' => 'ONEE'],
            ['type' => 'water', 'provider' => 'RADEEMA'],
            ['type' => 'internet', 'provider' => 'Maroc Telecom'],
            ['type' => 'phone', 'provider' => 'Orange'],
            ['type' => 'tax', 'provider' => 'DGI'],
        ];

        foreach ($createdCustomers as $customer) {
            foreach (array_slice($billProviders, 0, rand(1, 3)) as $bill) {
                $amount = rand(100, 800);
                $bp = BillPayment::create([
                    'reference' => BillPayment::generateReference(),
                    'customer_id' => $customer->id,
                    'agent_id' => $agent?->id,
                    'bill_type' => $bill['type'],
                    'provider' => $bill['provider'],
                    'account_number' => 'ACC' . rand(100000, 999999),
                    'amount' => $amount,
                    'fee' => 2.00,
                    'status' => 'paid',
                    'paid_at' => now()->subDays(rand(0, 30)),
                    'created_at' => now()->subDays(rand(0, 30)),
                    'updated_at' => now()->subDays(rand(0, 30)),
                ]);
                Transaction::create([
                    'reference' => Transaction::generateReference(),
                    'agent_id' => $agent?->id,
                    'customer_id' => $customer->id,
                    'type' => 'bill_payment',
                    'transactionable_type' => BillPayment::class,
                    'transactionable_id' => $bp->id,
                    'amount' => $amount,
                    'fee' => 2.00,
                    'status' => 'completed',
                    'description' => "Bill: {$bill['provider']}",
                    'created_at' => $bp->created_at,
                    'updated_at' => $bp->updated_at,
                ]);
            }

            $trf = Transfer::create([
                'reference' => Transfer::generateReference(),
                'agent_id' => $agent?->id,
                'sender_id' => $customer->id,
                'recipient_name' => 'Recipient ' . rand(1, 100),
                'recipient_phone' => '+33' . rand(600000000, 699999999),
                'recipient_city' => ['Paris', 'Lyon', 'Marseille', 'Madrid', 'Amsterdam'][rand(0, 4)],
                'amount' => rand(500, 5000),
                'fee' => rand(30, 80),
                'currency' => 'MAD',
                'type' => 'send',
                'status' => 'completed',
                'completed_at' => now()->subDays(rand(0, 30)),
                'created_at' => now()->subDays(rand(0, 30)),
                'updated_at' => now()->subDays(rand(0, 30)),
            ]);

            Transaction::create([
                'reference' => Transaction::generateReference(),
                'agent_id' => $agent?->id,
                'customer_id' => $customer->id,
                'type' => 'transfer',
                'transactionable_type' => Transfer::class,
                'transactionable_id' => $trf->id,
                'amount' => $trf->amount,
                'fee' => $trf->fee,
                'status' => 'completed',
                'description' => "Transfer to {$trf->recipient_name}",
                'created_at' => $trf->created_at,
                'updated_at' => $trf->updated_at,
            ]);
        }

        if ($agent) {
            AppNotification::create([
                'user_id' => $agent->id,
                'title' => 'Welcome to CashFlow Manager',
                'message' => 'Your account is active. Start processing transactions.',
                'type' => 'success',
            ]);
        }
    }
}
