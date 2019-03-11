use LWP::Simple;
use feature 'unicode_strings';
use utf8;
use Encode;
use Mojo::DOM;
use Mojo::Collection;
use DateTime;
binmode(STDOUT, ":utf8");

my $date = $ARGV[0];
my $url = "http://www.asahi.com/shimen/$date/index_tokyo_list.html";
my $html = get("$url");
my $dom = Mojo::DOM->new($html);

my $json = "[";
my $count = 0;
my @topics;

for my $li ($dom->find('div[id="page1"] li')->each) {
	my $class = $li->attr('class');
	next if $class =~ 'HeadlineImage';

	my $a = $li->find('a')->first;
	my $href = $a->attr('href');
	my $title = $a->all_text;
	next if $title =~ '^折々のことば';
	next if $title =~ '^（しつもん！ドラえもん';

	if ($title =~ '（(.*)）' && $title !~ '天声人語' && $title !~ '第１００回全国高校野球') {
		my $topic = $1;
		$topic =~ s/：.*//;
		push @topics, $topic;
	}

	$json .= "," if $count++;
	$json .= "{\"href\": \"$href\", \"title\": \"$title\"}";
}

foreach my $topic (@topics) {
	#if ($topic ne "") {
	for my $div ($dom->find('div[id^="page"]')->each) {
		next if $div->attr('id') eq 'page1';
		for my $li ($div->find('li')->each) {
			my $class = $li->attr('class');
			next if $class =~ 'Image';

			my $as = $li->find('a');
			next if $as->size == 0;

			my $a = $as->first;
			my $href = $a->attr('href');
			my $title = $a->all_text;
			next if $title !~ "（$topic）";

			$json .= "," if $count++;
			$json .= "{\"href\": \"$href\", \"title\": \"$title\"}";
		}
	}
}

$json .= "]";
print $json;
