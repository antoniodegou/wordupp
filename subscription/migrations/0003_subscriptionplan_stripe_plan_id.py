# Generated by Django 4.2.3 on 2023-09-20 07:02

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('subscription', '0002_usersubscription_stripe_customer_id'),
    ]

    operations = [
        migrations.AddField(
            model_name='subscriptionplan',
            name='stripe_plan_id',
            field=models.CharField(blank=True, max_length=255, null=True),
        ),
    ]
