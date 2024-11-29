<?php

namespace Database\Seeders;

use App\Models\brgy;
use App\Models\Farm;
use App\Models\User;
use App\Models\Farmer;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::factory(30)->create();

        User::factory()->create([
            'firstname' => 'kaye',
            'lastname' => 'panaligan',
            'status' => 'approved',
            'section' => 'rice',
            'role' => 'super admin',
            'email' => 'kaye@example.com',
            'password'=> 'asdf1234'
        ]);

    
    }
}